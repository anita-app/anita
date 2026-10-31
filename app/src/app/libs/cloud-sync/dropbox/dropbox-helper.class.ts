import { CloudSyncBase, SupportedCloud } from 'app/cross-refs-exports'
import { CloudSyncTable } from 'app/libs/cloud-sync/cloud-sync.const'
import { DropboxErrorCode, DropboxSyncError, getDropboxErrorMessage } from 'app/libs/cloud-sync/dropbox/dropbox-error.class'
import { dropboxPathForProject, parseProjectFile } from 'app/libs/cloud-sync/dropbox/dropbox-files.function'
import { DROPBOX_CLIENT_ID, DROPBOX_PROJECTS_FOLDER, DROPBOX_REMOTE_ID, DROPBOX_SCOPES } from 'app/libs/cloud-sync/dropbox/dropbox.const'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { SyncState } from 'app/state/sync/sync-state.class'
import { Dropbox, DropboxAuth } from 'dropbox'
import { liveQuery } from 'dexie'
import type { IDropboxAccountData, IDropboxFileLink, IDropboxTokens } from 'app/libs/cloud-sync/dropbox/dropbox.const'
import type { TAnitaUniversalDataStorage } from 'app/models/project/project.declarations'
import type { files } from 'dropbox'

const PENDING_AUTH_KEY = 'anita.dropbox.pendingAuth'
const PENDING_AUTH_MAX_AGE_MS = 30 * 60 * 1000

interface IPendingAuth {
  state: string
  codeVerifier: string
  createdAt: number
  /** Project to sync with Dropbox once connected. */
  linkProjectId?: string
}

export interface ICompletedDropboxLogin {
  accountName: string
  linkProjectId?: string
  /** Set when this device was connected to another Dropbox account. */
  previousAccountName?: string
  /** Stores the connection on this device. */
  commit: () => Promise<void>
}

/**
 * Metadata of a file, as used by the sync.
 */
export interface IDropboxFileMeta {
  fileId: string
  path: string
  name: string
  rev: string
}

/**
 * An entry of a folder, as shown in the folder picker.
 */
export interface IDropboxFolderEntry {
  kind: 'folder' | 'file'
  name: string
  /** Path to show and to use for folders. */
  path: string
  /** Id of a file, to link it. */
  fileId?: string
}

export interface IDownloadedProject extends IDropboxFileMeta {
  /** The project in the file, or null if the file is not an Anita project. */
  data: TAnitaUniversalDataStorage | null
}

const toFileMeta = (file: Pick<files.FileMetadata, 'id' | 'path_display' | 'path_lower' | 'name' | 'rev'>): IDropboxFileMeta => ({
  fileId: file.id,
  path: file.path_display ?? file.path_lower ?? file.name,
  name: file.name,
  rev: file.rev,
})

const randomString = (): string => Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('')

/**
 * The Dropbox account connected on this device: login, tokens and the file operations used by the sync.
 * API reference: https://www.dropbox.com/developers/documentation/http/documentation
 */
export class DropboxHelper extends CloudSyncBase<SupportedCloud.DROPBOX> {
  public static instance: DropboxHelper

  public static init (): DropboxHelper {
    DropboxHelper.instance = new DropboxHelper()
    return DropboxHelper.instance
  }

  private dbx: Dropbox | undefined
  private dbxAuth: DropboxAuth | undefined
  private redirectUri: string

  constructor () {
    super(SupportedCloud.DROPBOX)
    CloudSyncBase.initDB()
    // The app is served from PUBLIC_URL (/2 on anita-app.com, empty in development). Registered on Dropbox.
    this.redirectUri = `${window.location.origin}${process.env.PUBLIC_URL}/`
    this.watchChanges()
  }

  private watchChanges = () => {
    liveQuery(() => CloudSyncBase.getDB().table<IDropboxAccountData & { service: string }>(CloudSyncTable.ACCOUNTS).get(DROPBOX_REMOTE_ID))
      .subscribe((account) => {
        SyncState.setDropboxAccount(account?.refresh_token
          ? { accountId: account.account_id, accountName: account.account_name, email: account.email, needsReauth: !!account.needsReauth }
          : null)
      })
    liveQuery(() => CloudSyncBase.getDropboxLinks())
      .subscribe((links) => {
        SyncState.setDropboxLinks(links)
      })
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Login
  // ---------------------------------------------------------------------------------------------------------------

  /**
   * Opens the Dropbox login in this tab. Dropbox sends the user back to the app, where `completeLogin` is called.
   */
  public async startLogin (options: { linkProjectId?: string } = {}): Promise<void> {
    const auth = new DropboxAuth({ clientId: DROPBOX_CLIENT_ID })
    const state = randomString()
    const url = await auth.getAuthenticationUrl(this.redirectUri, state, 'code', 'offline', DROPBOX_SCOPES, undefined, true)
    const pending: IPendingAuth = {
      state,
      codeVerifier: auth.getCodeVerifier(),
      createdAt: Date.now(),
      linkProjectId: options.linkProjectId,
    }
    localStorage.setItem(PENDING_AUTH_KEY, JSON.stringify(pending))
    window.location.assign(url as unknown as string)
  }

  /**
   * Exchanges the code received from Dropbox for tokens. The connection is stored by calling `commit`.
   */
  public async completeLogin (code: string, state: string | undefined): Promise<ICompletedDropboxLogin> {
    const pending = DropboxHelper.readPendingAuth()
    if (!pending || (state && pending.state !== state)) {
      throw new DropboxSyncError(DropboxErrorCode.authFailed, 'This connection was not started from this browser, or it took too long. Please connect Dropbox again from Anita.')
    }
    DropboxHelper.clearPendingLogin()

    const auth = new DropboxAuth({ clientId: DROPBOX_CLIENT_ID })
    auth.setCodeVerifier(pending.codeVerifier)
    let tokens: IDropboxTokens
    try {
      tokens = (await auth.getAccessTokenFromCode(this.redirectUri, code)).result as unknown as IDropboxTokens
    } catch (error) {
      throw DropboxSyncError.from(error)
    }
    const accountData: IDropboxAccountData = { ...tokens, expires_at: Date.now() + tokens.expires_in * 1000, needsReauth: false }

    auth.setAccessToken(tokens.access_token)
    auth.setRefreshToken(tokens.refresh_token)
    auth.setAccessTokenExpiresAt(new Date(accountData.expires_at!))
    Object.assign(accountData, await DropboxHelper.readAccountInfo(new Dropbox({ auth })))

    const previous = await this.getDataForService(DROPBOX_REMOTE_ID)
    const switched = !!previous?.account_id && previous.account_id !== tokens.account_id
    return {
      accountName: accountData.account_name ?? 'your Dropbox account',
      linkProjectId: pending.linkProjectId,
      previousAccountName: switched ? (previous?.account_name ?? previous?.email ?? 'another account') : undefined,
      commit: async () => {
        this.resetClient()
        await this.storeDataForService(accountData, DROPBOX_REMOTE_ID)
        // Also set here, without waiting for the database watcher: the sync can start right away.
        SyncState.setDropboxAccount({ accountId: accountData.account_id, accountName: accountData.account_name, email: accountData.email, needsReauth: false })
        SyncState.updateRemoteStatus(DROPBOX_REMOTE_ID, { error: undefined })
      },
    }
  }

  public static clearPendingLogin (): void {
    localStorage.removeItem(PENDING_AUTH_KEY)
  }

  private static readPendingAuth (): IPendingAuth | null {
    try {
      const pending = JSON.parse(localStorage.getItem(PENDING_AUTH_KEY) ?? 'null') as IPendingAuth | null
      if (!pending || Date.now() - pending.createdAt > PENDING_AUTH_MAX_AGE_MS) {
        return null
      }
      return pending
    } catch {
      return null
    }
  }

  private static async readAccountInfo (dbx: Dropbox): Promise<Pick<IDropboxAccountData, 'account_name' | 'email'>> {
    try {
      const account = (await dbx.usersGetCurrentAccount()).result
      return { account_name: account.name.display_name, email: account.email }
    } catch {
      // Connections made before the account name was read lack the permission: the name is optional.
      return {}
    }
  }

  /**
   * Removes the Dropbox account from this device. Nothing is deleted in Dropbox.
   */
  public async forgetAccount (): Promise<void> {
    try {
      await this.dbx?.authTokenRevoke()
    } catch {
      // Already revoked, or offline: the tokens are forgotten anyway.
    }
    this.resetClient()
    await this.deleteDataForService(DROPBOX_REMOTE_ID)
    SyncState.updateRemoteStatus(DROPBOX_REMOTE_ID, { isSyncing: false, error: undefined, lastSync: undefined })
  }

  public isConnected (): boolean {
    const account = SyncState.getDropboxAccount()
    return !!account && !account.needsReauth
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Client
  // ---------------------------------------------------------------------------------------------------------------

  private resetClient (): void {
    this.dbx = undefined
    this.dbxAuth = undefined
  }

  private async getClient (): Promise<Dropbox> {
    if (this.dbx) {
      return this.dbx
    }
    const account = await this.getDataForService(DROPBOX_REMOTE_ID)
    if (!account?.refresh_token) {
      throw new DropboxSyncError(DropboxErrorCode.notConnected, 'Dropbox is not connected on this device.')
    }
    if (account.needsReauth) {
      throw new DropboxSyncError(DropboxErrorCode.authFailed, 'Log in to Dropbox again to resume syncing.')
    }
    this.dbxAuth = new DropboxAuth({ clientId: DROPBOX_CLIENT_ID })
    this.dbxAuth.setAccessToken(account.access_token)
    this.dbxAuth.setRefreshToken(account.refresh_token)
    if (account.expires_at) {
      // Without an expiry date the SDK would ask for a new access token before every request.
      this.dbxAuth.setAccessTokenExpiresAt(new Date(account.expires_at))
    }
    this.dbx = new Dropbox({ auth: this.dbxAuth })
    return this.dbx
  }

  /**
   * Runs an API call: stores the access token if the SDK renewed it, and converts errors.
   */
  private async call<T> (request: (dbx: Dropbox) => Promise<T>): Promise<T> {
    const dbx = await this.getClient()
    const tokenBefore = this.dbxAuth?.getAccessToken()
    try {
      return await request(dbx)
    } catch (error) {
      const syncError = DropboxSyncError.from(error)
      if (syncError.code === DropboxErrorCode.authFailed) {
        await this.markNeedsReauth(syncError)
      }
      throw syncError
    } finally {
      await this.storeRenewedToken(tokenBefore)
    }
  }

  private async storeRenewedToken (tokenBefore: string | undefined): Promise<void> {
    const auth = this.dbxAuth
    const token = auth?.getAccessToken()
    if (!auth || !token || token === tokenBefore) {
      return
    }
    await this.updateAccount({ access_token: token, expires_at: auth.getAccessTokenExpiresAt()?.getTime() })
  }

  private async updateAccount (changes: Partial<IDropboxAccountData>): Promise<void> {
    const account = await this.getDataForService(DROPBOX_REMOTE_ID)
    if (account) {
      await this.storeDataForService({ ...account, ...changes }, DROPBOX_REMOTE_ID)
    }
  }

  public async markNeedsReauth (error: DropboxSyncError): Promise<void> {
    this.resetClient()
    await this.updateAccount({ needsReauth: true })
    SyncState.updateRemoteStatus(DROPBOX_REMOTE_ID, { isSyncing: false, error: getDropboxErrorMessage(error) })
  }

  /**
   * Reads the name of the account again, e.g. for connections made by older versions of the app.
   */
  public async refreshAccountInfo (): Promise<void> {
    const account = await this.getDataForService(DROPBOX_REMOTE_ID)
    if (!account || account.account_name) {
      return
    }
    const info = await DropboxHelper.readAccountInfo(await this.getClient())
    if (info.account_name) {
      await this.updateAccount(info)
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Files
  // ---------------------------------------------------------------------------------------------------------------

  /**
   * JSON files in the projects folder. The folder may not exist yet.
   */
  public async listProjectFiles (): Promise<Array<IDropboxFileMeta>> {
    return this.call(async (dbx) => {
      const entries: files.ListFolderResult['entries'] = []
      try {
        let page = (await dbx.filesListFolder({ path: DROPBOX_PROJECTS_FOLDER })).result
        entries.push(...page.entries)
        while (page.has_more) {
          page = (await dbx.filesListFolderContinue({ cursor: page.cursor })).result
          entries.push(...page.entries)
        }
      } catch (error) {
        if (DropboxSyncError.from(error).code === DropboxErrorCode.notFound) {
          return []
        }
        throw error
      }
      return entries
        .filter((entry): entry is files.FileMetadataReference => entry['.tag'] === 'file' && entry.name.toLowerCase().endsWith('.json'))
        .map(toFileMeta)
    })
  }

  /**
   * Folders and files of a folder ('' for the root), folders first, in alphabetical order.
   */
  public async listFolder (path: string): Promise<Array<IDropboxFolderEntry>> {
    return this.call(async (dbx) => {
      const entries: files.ListFolderResult['entries'] = []
      let page = (await dbx.filesListFolder({ path })).result
      entries.push(...page.entries)
      while (page.has_more) {
        page = (await dbx.filesListFolderContinue({ cursor: page.cursor })).result
        entries.push(...page.entries)
      }
      return entries
        .filter(entry => entry['.tag'] === 'folder' || entry['.tag'] === 'file')
        .map((entry): IDropboxFolderEntry => ({
          kind: entry['.tag'] === 'folder' ? 'folder' : 'file',
          name: entry.name,
          path: entry.path_display ?? entry.path_lower ?? `${path}/${entry.name}`,
          fileId: entry['.tag'] === 'file' ? (entry as files.FileMetadataReference).id : undefined,
        }))
        .sort((a, b) => (a.kind === b.kind ? a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }) : (a.kind === 'folder' ? -1 : 1)))
    })
  }

  /**
   * Creates a folder and returns its path.
   */
  public async createFolder (path: string): Promise<string> {
    return this.call(async (dbx) => {
      const folder = (await dbx.filesCreateFolderV2({ path, autorename: false })).result.metadata
      return folder.path_display ?? path
    })
  }

  public async downloadProject (fileId: string): Promise<IDownloadedProject> {
    return this.call(async (dbx) => {
      const result = (await dbx.filesDownload({ path: fileId })).result as files.FileMetadata & { fileBlob: Blob }
      return { ...toFileMeta(result), data: parseProjectFile(await result.fileBlob.text()) }
    })
  }

  /**
   * Current metadata of a file, or null if it was deleted.
   */
  public async getFileMeta (fileId: string): Promise<IDropboxFileMeta | null> {
    try {
      return await this.call(async (dbx) => {
        const result = (await dbx.filesGetMetadata({ path: fileId })).result
        return result['.tag'] === 'file' ? toFileMeta(result as files.FileMetadataReference) : null
      })
    } catch (error) {
      if (DropboxSyncError.from(error).code === DropboxErrorCode.notFound) {
        return null
      }
      throw error
    }
  }

  /**
   * Saves a project in a new file, in the projects folder or in the given one.
   */
  public async createProjectFile (data: TAnitaUniversalDataStorage, folder: string = DROPBOX_PROJECTS_FOLDER): Promise<IDropboxFileMeta> {
    return this.call(async (dbx) => toFileMeta((await dbx.filesUpload({
      path: dropboxPathForProject(data[RESERVED_AUDS_KEYS._settings]?.[0]?.title, folder),
      contents: JSON.stringify(data, null, 2),
      mode: { '.tag': 'add' },
      autorename: true,
    })).result))
  }

  /**
   * Replaces the content of a project file. With `rev`, fails with a conflict if the file was changed since then.
   */
  public async updateProjectFile (fileId: string, data: TAnitaUniversalDataStorage, rev?: string): Promise<IDropboxFileMeta> {
    return this.call(async (dbx) => toFileMeta((await dbx.filesUpload({
      path: fileId,
      contents: JSON.stringify(data, null, 2),
      mode: rev ? { '.tag': 'update', update: rev } : { '.tag': 'overwrite' },
      autorename: false,
      mute: true,
    })).result))
  }

  /**
   * Moves a file to the deleted files of Dropbox, where it can be restored for a while.
   */
  public async deleteFile (fileId: string): Promise<void> {
    try {
      await this.call(dbx => dbx.filesDeleteV2({ path: fileId }))
    } catch (error) {
      if (DropboxSyncError.from(error).code !== DropboxErrorCode.notFound) {
        throw error
      }
    }
  }

  public static linkFromMeta (projectId: string, meta: IDropboxFileMeta): IDropboxFileLink {
    return { projectId, fileId: meta.fileId, path: meta.path, name: meta.name, rev: meta.rev }
  }
}
