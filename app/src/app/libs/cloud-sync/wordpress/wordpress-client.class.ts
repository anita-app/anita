import axios from 'axios'
import { WordPressApiError, WordPressErrorCode } from 'app/libs/cloud-sync/wordpress/wordpress-api-error.class'
import type {
  IWordPressAuthData,
  IWordPressBatchOperation,
  IWordPressBatchResult,
  IWordPressPingResponse,
  IWordPressProjectMeta,
  IWordPressProjectResponse,
  IWordPressSpaceInfo,
  TAccessLevel,
} from 'app/libs/cloud-sync/wordpress/wordpress.const'
import type { TAnitaUniversalDataStorage, TSystemData } from 'app/models/project/project.declarations'
import type { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'

const REQUEST_TIMEOUT_MS = 30000
const BATCH_SIZE = 200

export interface IWordPressClientHooks {
  /** Called after the tokens are refreshed, to persist them. */
  onTokensRefreshed: (authData: IWordPressAuthData) => Promise<void> | void
  /** Called when the session is no longer valid and the user must log in again. */
  onAuthFailed: (error: WordPressApiError) => Promise<void> | void
}

interface ITokensResponse {
  access_token: string
  refresh_token: string
  access_token_expires_in: number
  user_id: number
}

interface IRetriableConfig extends AxiosRequestConfig {
  anitaRetried?: boolean
}

/**
 * Turns any axios error into a WordPressApiError.
 */
const toApiError = (error: unknown): WordPressApiError => {
  if (error instanceof WordPressApiError) {
    return error
  }
  const axiosError = error as AxiosError<{ code?: string; message?: string }>
  if (!axiosError?.isAxiosError) {
    return WordPressApiError.from(error)
  }
  if (!axiosError.response) {
    return new WordPressApiError(WordPressErrorCode.network, 'The site could not be reached.')
  }
  const { status, data } = axiosError.response
  if (data?.code === 'rest_no_route') {
    return new WordPressApiError(WordPressErrorCode.pluginMissing, 'The Anita Project Manager plugin is not active on this site.', status)
  }
  if (data?.code) {
    return new WordPressApiError(data.code, data.message ?? axiosError.message, status)
  }
  return new WordPressApiError(WordPressErrorCode.unknown, `Unexpected response from the site (HTTP ${status}).`, status)
}

/**
 * Client for the REST API of the Anita Project Manager plugin.
 * See anita-project-manager-for-wordpress/docs/API.md.
 */
export class WordPressClient {
  private static refreshes: Record<string, Promise<string> | undefined> = {}
  private axiosInstance: AxiosInstance

  constructor (
    private remoteId: string,
    private authData: IWordPressAuthData,
    private hooks?: IWordPressClientHooks,
  ) {
    this.axiosInstance = axios.create({
      baseURL: WordPressClient.getApiUrl(authData),
      timeout: REQUEST_TIMEOUT_MS,
    })

    this.axiosInstance.interceptors.request.use((config) => {
      config.headers.set('Authorization', `Bearer ${this.authData.access_token}`)
      // Some hosts strip the Authorization header.
      config.headers.set('X-Anita-Token', this.authData.access_token)
      return config
    })

    this.axiosInstance.interceptors.response.use((response) => response, this.handleResponseError)
  }

  /**
   * Checks that the plugin is installed on a site. Tries the pretty REST URL first, then the one that works with plain permalinks.
   */
  public static async ping (siteUrl: string): Promise<IWordPressPingResponse> {
    const base = siteUrl.replace(/\/+$/, '')
    const candidates = [`${base}/wp-json/anita-api/v1/ping`, `${base}/?rest_route=/anita-api/v1/ping`]
    let lastError: WordPressApiError | undefined
    for (const url of candidates) {
      try {
        const response = await axios.get<IWordPressPingResponse>(url, { timeout: REQUEST_TIMEOUT_MS })
        if (response.data?.plugin === 'anita-project-manager') {
          return response.data
        }
        lastError = new WordPressApiError(WordPressErrorCode.pluginMissing, 'The Anita Project Manager plugin is not active on this site.')
      } catch (error) {
        const apiError = toApiError(error)
        // A WordPress answer (e.g. rest_no_route) is more informative than a network error.
        if (!lastError || lastError.code === WordPressErrorCode.network) {
          lastError = apiError
        }
      }
    }
    throw lastError ?? new WordPressApiError(WordPressErrorCode.network, 'The site could not be reached.')
  }

  /**
   * Exchanges the single-use code received at the end of the login for tokens.
   */
  public static async exchangeCode (apiUrl: string, code: string, codeVerifier: string): Promise<ITokensResponse> {
    try {
      const response = await axios.post<ITokensResponse>(`${apiUrl}exchange-code`, { code, code_verifier: codeVerifier }, { timeout: REQUEST_TIMEOUT_MS })
      return response.data
    } catch (error) {
      throw toApiError(error)
    }
  }

  public static getApiUrl (authData: Pick<IWordPressAuthData, 'apiUrl' | 'remoteBaseUrl'>): string {
    return authData.apiUrl || `${authData.remoteBaseUrl.replace(/\/+$/, '')}/wp-json/anita-api/v1/`
  }

  public getRemoteId (): string {
    return this.remoteId
  }

  public async getSpaceInfo (): Promise<IWordPressSpaceInfo> {
    return (await this.request<IWordPressSpaceInfo>({ method: 'GET', url: 'get-space-info' }))
  }

  public async getProjectsIndex (): Promise<Array<IWordPressProjectMeta>> {
    return (await this.request<Array<IWordPressProjectMeta>>({ method: 'GET', url: 'get-projects-index' })) ?? []
  }

  /**
   * Returns the project, or null if it does not exist or is not visible to the user.
   */
  public async getProjectById (projectId: string): Promise<IWordPressProjectResponse | null> {
    try {
      return await this.request<IWordPressProjectResponse>({ method: 'GET', url: `get-project/${encodeURIComponent(projectId)}` })
    } catch (error) {
      if (error instanceof WordPressApiError && error.code === WordPressErrorCode.notFound) {
        return null
      }
      throw error
    }
  }

  /**
   * Creates or updates a project: settings, sections and the records included in the payload.
   */
  public async saveProject (project: TSystemData | TAnitaUniversalDataStorage, options: { accessLevel?: TAccessLevel; replaceSections?: boolean } = {}): Promise<IWordPressProjectMeta> {
    const response = await this.request<{ project_id: string; meta: IWordPressProjectMeta }>({
      method: 'POST',
      url: 'save-project',
      data: {
        project,
        access_level: options.accessLevel,
        replace_sections: options.replaceSections ?? false,
      },
    })
    return response.meta
  }

  public async deleteProject (projectId: string): Promise<void> {
    await this.request({ method: 'POST', url: 'delete-project', data: { projectId } })
  }

  public async saveSectionElement (projectId: string, sectionId: string, elementId: string, element: object): Promise<void> {
    await this.request({ method: 'POST', url: 'save-section-element', data: { projectId, sectionId, elementId, element } })
  }

  public async deleteSectionElement (projectId: string, sectionId: string, elementId: string): Promise<void> {
    await this.request({ method: 'DELETE', url: 'delete-section-element', data: { projectId, sectionId, elementId } })
  }

  /**
   * Sends record changes in batches. Returns the operations that failed.
   */
  public async batchSectionElements (projectId: string, operations: Array<IWordPressBatchOperation>): Promise<Array<{ operation: IWordPressBatchOperation; error: WordPressApiError }>> {
    const failures: Array<{ operation: IWordPressBatchOperation; error: WordPressApiError }> = []
    for (let start = 0; start < operations.length; start += BATCH_SIZE) {
      const chunk = operations.slice(start, start + BATCH_SIZE)
      const response = await this.request<{ results: Array<IWordPressBatchResult> }>({
        method: 'POST',
        url: 'batch-section-elements',
        data: { projectId, operations: chunk },
      })
      response.results.forEach((result) => {
        if (!result.ok) {
          failures.push({ operation: chunk[result.index], error: new WordPressApiError(result.code ?? WordPressErrorCode.unknown, result.message ?? '') })
        }
      })
    }
    return failures
  }

  private async request<T = unknown> (config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.request<T>(config)
      return response.data
    } catch (error) {
      throw toApiError(error)
    }
  }

  private handleResponseError = async (error: AxiosError<{ code?: string }>) => {
    const config = error.config as IRetriableConfig | undefined
    if (error.response?.data?.code !== WordPressErrorCode.tokenExpired || !config || config.anitaRetried) {
      const apiError = toApiError(error)
      if (apiError.requiresLogin) {
        await this.hooks?.onAuthFailed(apiError)
      }
      return Promise.reject(apiError)
    }
    config.anitaRetried = true
    const accessToken = await this.refreshAccessToken()
    config.headers = { ...config.headers, Authorization: `Bearer ${accessToken}`, 'X-Anita-Token': accessToken } as any
    return this.axiosInstance.request(config)
  }

  /**
   * Refreshes the tokens. Concurrent requests share the same refresh.
   */
  private async refreshAccessToken (): Promise<string> {
    if (!WordPressClient.refreshes[this.remoteId]) {
      WordPressClient.refreshes[this.remoteId] = this.doRefresh().finally(() => {
        WordPressClient.refreshes[this.remoteId] = undefined
      })
    }
    const accessToken = await WordPressClient.refreshes[this.remoteId]!
    this.authData = { ...this.authData, access_token: accessToken }
    return accessToken
  }

  private async doRefresh (): Promise<string> {
    try {
      const response = await axios.post<ITokensResponse>(`${WordPressClient.getApiUrl(this.authData)}refresh-token`, {
        refresh_token: this.authData.refresh_token,
      }, { timeout: REQUEST_TIMEOUT_MS })
      this.authData = { ...this.authData, access_token: response.data.access_token, refresh_token: response.data.refresh_token }
      await this.hooks?.onTokensRefreshed(this.authData)
      return this.authData.access_token
    } catch (error) {
      const apiError = toApiError(error)
      if (apiError.requiresLogin) {
        await this.hooks?.onAuthFailed(apiError)
      }
      throw apiError
    }
  }
}
