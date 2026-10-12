import { CloudSyncBase, SupportedCloud } from 'app/cross-refs-exports'
import { CloudSyncTable } from 'app/libs/cloud-sync/cloud-sync.const'
import { WordPressClient } from 'app/libs/cloud-sync/wordpress/wordpress-client.class'
import { WordPressApiError, WordPressErrorCode, getWordPressErrorMessage } from 'app/libs/cloud-sync/wordpress/wordpress-api-error.class'
import { SyncState } from 'app/state/sync/sync-state.class'
import { liveQuery } from 'dexie'
import type { IWordPressAuthData, IWordPressRemoteInfo, IWordPressSpaceInfo } from 'app/libs/cloud-sync/wordpress/wordpress.const'

/**
 * Connected WordPress sites: credentials, site information and API clients.
 * API reference: anita-project-manager-for-wordpress/docs/API.md
 */
export class WordpressHelper extends CloudSyncBase<SupportedCloud.WORDPRESS> {
  public static instance: WordpressHelper
  private clients: Record<string, WordPressClient> = {}

  public static init (): WordpressHelper {
    WordpressHelper.instance = new WordpressHelper()
    return WordpressHelper.instance
  }

  constructor () {
    super(SupportedCloud.WORDPRESS)
    CloudSyncBase.initDB()
    this.watchRemotesChanges()
  }

  /**
   * The id of a site, as stored in the `remoteStorage` setting of its projects: the address without protocol and "www.".
   * The plugin computes the same value, so it is identical on every device.
   */
  public static normalizeRemoteId (url: string): string {
    return url.trim().replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/+$/, '').toLowerCase()
  }

  private watchRemotesChanges = () => {
    liveQuery(() => CloudSyncBase.getDB().table<IWordPressRemoteInfo>(CloudSyncTable.REMOTES_INFO).toArray())
      .subscribe((remotes) => {
        SyncState.setWordPressRemotes(remotes)
      })
  }

  public getRemoteName (remoteId: string): string {
    return SyncState.getWordPressRemote(remoteId)?.data.site_name || remoteId
  }

  /**
   * Returns the API client of a site. Throws if the site is not connected on this device.
   */
  public async getClient (remoteId: string): Promise<WordPressClient> {
    if (this.clients[remoteId]) {
      return this.clients[remoteId]
    }
    const authData = await this.getDataForService(remoteId)
    if (!authData?.access_token) {
      throw new WordPressApiError(WordPressErrorCode.notConnected, `${this.getRemoteName(remoteId)} is not connected on this device.`)
    }
    const data: IWordPressAuthData = {
      access_token: authData.access_token,
      refresh_token: authData.refresh_token,
      remoteBaseUrl: authData.remoteBaseUrl,
      apiUrl: authData.apiUrl,
    }
    this.clients[remoteId] = new WordPressClient(remoteId, data, {
      onTokensRefreshed: async (refreshed) => {
        await this.storeDataForService(refreshed, remoteId)
      },
      onAuthFailed: (error) => this.markNeedsReauth(remoteId, error),
    })
    return this.clients[remoteId]
  }

  /**
   * Stores the credentials and the information of a site after the user logged in.
   */
  public async saveConnection (remoteId: string, authData: IWordPressAuthData, spaceInfo: IWordPressSpaceInfo): Promise<void> {
    delete this.clients[remoteId]
    await this.storeDataForService(authData, remoteId)
    await this.saveRemoteInfo(remoteId, spaceInfo, false)
    SyncState.updateRemoteStatus(remoteId, { error: undefined })
  }

  public async refreshSpaceInfo (remoteId: string): Promise<IWordPressSpaceInfo> {
    const client = await this.getClient(remoteId)
    const spaceInfo = await client.getSpaceInfo()
    await this.saveRemoteInfo(remoteId, spaceInfo, false)
    return spaceInfo
  }

  public async markNeedsReauth (remoteId: string, error: WordPressApiError): Promise<void> {
    delete this.clients[remoteId]
    if (SyncState.getWordPressRemote(remoteId)) {
      await this.setRemoteNeedsReauth(remoteId, true)
    }
    SyncState.updateRemoteStatus(remoteId, { isSyncing: false, error: getWordPressErrorMessage(error, this.getRemoteName(remoteId)) })
  }

  /**
   * Removes the credentials and the information of a site from this device.
   */
  public async forgetRemote (remoteId: string): Promise<void> {
    delete this.clients[remoteId]
    await this.deleteRemoteInfo(remoteId)
    SyncState.updateRemoteStatus(remoteId, { isSyncing: false, error: undefined, lastSync: undefined })
  }

  public async getRemoteUserId (remoteId: string): Promise<number | undefined> {
    return (await this.getRemoteInfo(remoteId))?.data.user_id
  }
}
