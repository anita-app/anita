import { CloudSyncBase, SupportedCloud } from 'app/libs/cloud-sync/cloud-sync-base.class'
import { IDropboxTokens, ISharedFileMeta } from 'app/libs/cloud-sync/cloud-sync.const'
import { TAnitaUniversalDataStorage } from 'app/models/project/project.declarations'
import { Dropbox, DropboxAuth, files } from 'dropbox'

export class DropboxHelper extends CloudSyncBase {
  public static instance: DropboxHelper

  public static init (): DropboxHelper {
    DropboxHelper.instance = new DropboxHelper()
    return DropboxHelper.instance
  }

  private dbxAuth: DropboxAuth | undefined
  private dbx: Dropbox | undefined
  private CLIENT_ID: string = 'neonkm3wexybl7c'
  private BASE_URL: string = ''

  constructor () {
    super(SupportedCloud.DROPBOX)
    this.dbxAuth = new DropboxAuth({ clientId: this.CLIENT_ID })
    CloudSyncBase.initDB()
    this.setBaseUrl()
  }

  public startAuthProcess = async () => {
    const authUrl = await this.getAuthenticationUrl()
    window.open(authUrl as unknown as string, '_blank')
  }

  public async getAuthenticationUrl (): Promise<String> {
    const scopes = [
      'files.content.write',
      'files.content.read',
      'file_requests.write',
      'file_requests.read'
    ]
    const url = await this.dbxAuth!.getAuthenticationUrl(`${this.BASE_URL}`, undefined, 'code', 'offline', scopes, undefined, true)
    window.sessionStorage.clear()
    // @ts-ignore
    window.sessionStorage.setItem('codeVerifier', this.dbxAuth!.codeVerifier)
    return url
  }

  public async getAccessTokenFromCode (code: string) {
    this.dbxAuth!.setCodeVerifier(window.sessionStorage.getItem('codeVerifier') as string)
    const response = await this.dbxAuth!.getAccessTokenFromCode(this.BASE_URL, code)
    if (response.result) {
      await this.storeDataForService(response.result as unknown as IDropboxTokens)
    }
    this.authWithTokens()
  }

  public async authWithTokens () {
    const tokens = await this.getDataForService()
    if (tokens) {
      this.dbxAuth!.setAccessToken(tokens.access_token)
      this.dbxAuth!.setRefreshToken(tokens.refresh_token)
      this.dbx = new Dropbox({
        auth: this.dbxAuth
      })
    }
  }

  public async getFileListForPath (path: string = ''): Promise<Array<ISharedFileMeta>> {
    if (!this.dbx) {
      await this.authWithTokens()
    }
    const response = await this.dbx!.filesListFolder({ path })
    const allResults: files.ListFolderResult['entries'] = []
    if (response.result?.entries) {
      allResults.push(...response.result.entries)
      if (response.result.has_more) {
        await this.getMoreFilesWithCursor(allResults, response.result.cursor)
      }
    }
    return this.convertFileList(allResults)
  }

  private async getMoreFilesWithCursor (allResults: files.ListFolderResult['entries'], cursor: string) {
    const moreResults = await this.dbx!.filesListFolderContinue({ cursor })
    if (moreResults.result?.entries?.length) {
      allResults.push(...moreResults?.result?.entries)
    }
    if (moreResults?.result?.has_more) {
      await this.getMoreFilesWithCursor(allResults, moreResults.result.cursor)
    }
  }

  public async uploadFile (path: string, fileName: string, contents: string) {
    if (await this.isAuthenticated()) {
      const pathWithFileName = path.endsWith('/') ? `${path}${fileName}` : `${path}/${fileName}`
      const res = await this.dbx!.filesUpload({ path: pathWithFileName, contents })
      if (res.result?.id) {
        this.setRemoteId(res.result.id)
      }
    } else {
      this.startAuthProcess()
    }
  }

  public async downloadFile (projectId: string, fileId: string): Promise<any> {
    if (!this.dbx) {
      await this.authWithTokens()
    }
    try {
      const response = await this.dbx!.filesDownload({ path: fileId })
      if (response.result) {
        // @ts-ignore
        const fileBlob = response.result.fileBlob
        const reader = new FileReader()
        reader.readAsText(fileBlob)
        return new Promise((resolve, reject) => {
          reader.onload = () => {
            resolve(JSON.parse(reader.result as string) as TAnitaUniversalDataStorage)
          }
          reader.onerror = () => {
            reject(reader.error)
          }
        })
      }
    } catch (error: any) {
      if (error?.error?.error_summary?.includes('path/not_found/')) {
        this.clearRemoteId(projectId)
      }
      return null
    }
  }

  public async updateFile (fileId: string, contents: TAnitaUniversalDataStorage) {
    if (!this.dbx) {
      await this.authWithTokens()
    }
    await this.dbx!.filesUpload({ path: fileId, contents: JSON.stringify(contents, null, 2), mode: { '.tag': 'overwrite' } })
  }

  public async isAuthenticated () {
    if (this.dbx) {
      return true
    }
    await this.authWithTokens()
    return !!this.dbx
  }

  private setBaseUrl () {
    this.BASE_URL = window.location.href.split('#')[0]
  }

  private convertFileList = (files: files.ListFolderResult['entries']): Array<ISharedFileMeta> => (
    files.map((file: files.ListFolderResult['entries'][0]) => {
      if (file['.tag'] !== 'deleted' && !!file.id) {
        return {
          type: file['.tag'],
          name: file.name,
          path: file.path_lower,
          id: file.id
        }
      }
      return null
    }).filter((file: ISharedFileMeta | null) => !!file) as Array<ISharedFileMeta>
  )
}
