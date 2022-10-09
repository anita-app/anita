import { CloudSyncBase, SupportedCloud } from 'app/libs/cloud-sync/cloud-sync-base.class'
import { IDropboxTokens } from 'app/libs/cloud-sync/cloud-sync.const'
import { Dropbox, DropboxAuth, files } from 'dropbox'

export class DropboxHelper extends CloudSyncBase {
  private dbxAuth: DropboxAuth | undefined
  private dbx: Dropbox | undefined
  private CLIENT_ID: string = 'neonkm3wexybl7c'
  private BASE_URL: string = ''

  constructor () {
    super()
    this.dbxAuth = new DropboxAuth({ clientId: this.CLIENT_ID })
    this.initDB()
    this.setBaseUrl()
  }

  public async getAuthenticationUrl (): Promise<String> {
    const scopes = [
      'files.content.write',
      'files.content.read'
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
      await this.storeDataForService(SupportedCloud.DROPBOX, response.result as unknown as IDropboxTokens)
    }
    this.authWithTokens()
  }

  public async authWithTokens () {
    const tokens = await this.getDataForService(SupportedCloud.DROPBOX)
    if (tokens) {
      this.dbxAuth!.setAccessToken(tokens.access_token)
      this.dbxAuth!.setRefreshToken(tokens.refresh_token)
      this.dbx = new Dropbox({
        auth: this.dbxAuth
      })
    }
  }

  public async getFileListForPath (path: string = ''): Promise<files.ListFolderResult> {
    if (!this.dbx) {
      await this.authWithTokens()
    }
    const response = await this.dbx!.filesListFolder({ path })
    console.log('getFileListForPath ~ response.result', response.result)
    return response.result
  }

  public saveToken (data: IDropboxTokens): void {
    this.storeDataForService(SupportedCloud.DROPBOX, data)
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

  public openChooser () {

  }
}
