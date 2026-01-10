import { Manager } from 'app/cross-refs-exports'
import { DateTools } from 'app/libs/tools/date-tools.class'
import Dexie from 'dexie'
import { CloudSyncTable } from './cloud-sync.const'
import type { IWordPressAuthData } from 'app/libs/cloud-sync/wordpress/wordpress-helper.class'
import type { IWordPressRemoteInfo, IWordPressSpaceInfo } from 'app/libs/cloud-sync/wordpress/wordpress.const'
import type { IDropboxTokens } from './cloud-sync.const'

const DB_VERSION = 6

export enum SupportedCloud {
  DROPBOX = 'dropbox',
  WORDPRESS = 'wordpress',
}

interface IAccountsTableForDropbox extends IDropboxTokens {
  service: SupportedCloud
}

interface IAccountsTableForWordpress extends IWordPressAuthData {
  service: SupportedCloud
}

type TDataForTable<T extends SupportedCloud> = T extends SupportedCloud.DROPBOX ? IDropboxTokens : IWordPressAuthData

type TAccountsTable<T extends SupportedCloud> = T extends SupportedCloud.DROPBOX ? IAccountsTableForDropbox : IAccountsTableForWordpress

interface ICloudSyncDB<T extends SupportedCloud> {
  [CloudSyncTable.ACCOUNTS]: TAccountsTable<T>
  [CloudSyncTable.SYNC_INFO]: {
    projectId: string
    lastSync: string
  }
  [CloudSyncTable.FILES_INFO]: {
    projectId: string
    fileId: string
  }
  [CloudSyncTable.REMOTES_INFO]: IWordPressRemoteInfo
}

export class CloudSyncBase<T extends SupportedCloud> {
  private static DB: Dexie | undefined
  constructor (
    private service: T,
  ) { }

  public static getDB (): Dexie {
    CloudSyncBase.initDB()
    return CloudSyncBase.DB!
  }

  public async getLinkedFileIdOrNull (projectId: string | undefined): Promise<string | null> {
    if (!projectId) {
      return null
    }
    CloudSyncBase.initDB()
    return (await CloudSyncBase.DB!.table<ICloudSyncDB<SupportedCloud.DROPBOX>['filesInfo']>(CloudSyncTable.FILES_INFO).get({ projectId }))?.fileId ?? null
  }

  protected async setRemoteId (remoteId: string) {
    const currentProject = Manager.getCurrentProject()

    if (!currentProject) {
      return
    }
    await CloudSyncBase.DB!.table<ICloudSyncDB<SupportedCloud.DROPBOX>['filesInfo']>(CloudSyncTable.FILES_INFO).put({ projectId: currentProject.getId(), fileId: remoteId })
    Manager.loadProjectById(currentProject.getId())
  }

  public static async clearRemoteId (projectId: string) {
    await CloudSyncBase.DB!.table<ICloudSyncDB<SupportedCloud.DROPBOX>['filesInfo']>(CloudSyncTable.FILES_INFO).delete(projectId)
  }

  protected static initDB () {
    if (!CloudSyncBase.DB) {
      CloudSyncBase.DB = new Dexie('CloudSync')
      CloudSyncBase.DB.version(DB_VERSION).stores({
        [CloudSyncTable.ACCOUNTS]: 'service',
        [CloudSyncTable.SYNC_INFO]: 'projectId',
        [CloudSyncTable.FILES_INFO]: 'projectId',
        [CloudSyncTable.REMOTES_INFO]: 'remoteId',
      })
    }
  }

  public storeDataForService = (data: TDataForTable<T>, idToUse?: string) => (
    CloudSyncBase.DB!.table<ICloudSyncDB<T>['accounts']>(CloudSyncTable.ACCOUNTS).put({ ...data, service: idToUse || this.service } as TAccountsTable<T>)
  )

  protected getDataForService (idToUse?: string): Promise<ICloudSyncDB<T>['accounts'] | undefined> {
    return CloudSyncBase.DB!.table<ICloudSyncDB<T>['accounts']>(CloudSyncTable.ACCOUNTS).get({ service: idToUse || this.service })
  }

  public async setLastSync (projectId: string) {
    return CloudSyncBase.DB!.table<ICloudSyncDB<T>['syncInfo']>(CloudSyncTable.SYNC_INFO).put({ projectId, lastSync: DateTools.getUtcIsoString() })
  }

  public static async getLastSync <T extends SupportedCloud> (projectId: string): Promise<string | undefined> {
    return (await CloudSyncBase.DB!.table<ICloudSyncDB<T>['syncInfo']>(CloudSyncTable.SYNC_INFO).get({ projectId }))?.lastSync
  }

  public static async deleteLastSync <T extends SupportedCloud> (projectId: string): Promise<void> {
    return CloudSyncBase.DB!.table<ICloudSyncDB<T>['syncInfo']>(CloudSyncTable.SYNC_INFO).delete(projectId)
  }

  protected async saveRemoteInfo (remoteId: string, data: IWordPressSpaceInfo) {
    return CloudSyncBase.DB!.table<ICloudSyncDB<T>['remotesInfo']>(CloudSyncTable.REMOTES_INFO).put({ remoteId, data })
  }

  public async getAllRemotesInfo (): Promise<Array<ICloudSyncDB<T>['remotesInfo']>> {
    return CloudSyncBase.DB!.table<ICloudSyncDB<T>['remotesInfo']>(CloudSyncTable.REMOTES_INFO).toArray()
  }

  public async getRemoteInfo (remoteId: string): Promise<ICloudSyncDB<T>['remotesInfo'] | undefined> {
    return CloudSyncBase.DB!.table<ICloudSyncDB<T>['remotesInfo']>(CloudSyncTable.REMOTES_INFO).get(remoteId)
  }

  protected async getAllAccounts (): Promise<Array<ICloudSyncDB<T>['accounts']>> {
    return CloudSyncBase.DB!.table<ICloudSyncDB<T>['accounts']>(CloudSyncTable.ACCOUNTS).toArray()
  }
}
