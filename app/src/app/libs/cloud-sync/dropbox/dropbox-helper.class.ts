import { CloudSyncBase, SupportedCloud } from 'app/libs/cloud-sync/cloud-sync-base.class'
import { IDropboxTokens, ISharedFileMeta } from 'app/libs/cloud-sync/cloud-sync.const'
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
    return this.convertFileList(response?.result?.entries || [])
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

  public async downloadFile (fileId: string): Promise<any> {
    if (!this.dbx) {
      await this.authWithTokens()
    }
    const fileMeta = await this.dbx!.fileRequestsGet({ id: fileId })
    console.log('downloadFile ~ fileMeta', fileMeta)
    if (fileMeta.result) {
      const fileData = await this.dbx!.filesExport({ path: fileMeta.result.destination!, export_format: 'json' })
      console.log('downloadFile ~ fileData', fileData)
    }
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
