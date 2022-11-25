import { Manager } from 'app/libs/manager/manager.class'
import { DateTools } from 'app/libs/tools/date-tools.class'
import Dexie from 'dexie'
import { IDropboxTokens } from './cloud-sync.const'

const DB_VERSION = 4

export enum SupportedCloud {
  DROPBOX = 'dropbox'
}

interface IAccountsTable extends IDropboxTokens {
  service: SupportedCloud
}

enum CloudSyncTable {
  ACCOUNTS = 'accounts',
  SYNC_INFO = 'syncInfo',
  FILES_INFO = 'filesInfo'
}

interface ICloudSyncDB {
  [CloudSyncTable.ACCOUNTS]: IAccountsTable
  [CloudSyncTable.SYNC_INFO]: {
    projectId: string
    lastSync: string
  }
  [CloudSyncTable.FILES_INFO]: {
    projectId: string
    fileId: string
  }
}

export class CloudSyncBase<T extends IDropboxTokens = IDropboxTokens> {
  private static DB: Dexie | undefined
  constructor (
    private service: SupportedCloud
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
    return (await CloudSyncBase.DB!.table<ICloudSyncDB['filesInfo']>(CloudSyncTable.FILES_INFO).get({ projectId }))?.fileId ?? null
  }

  protected async setRemoteId (remoteId: string) {
    const currentProject = Manager.getCurrentProject()

    if (!currentProject) {
      return
    }
    await CloudSyncBase.DB!.table<ICloudSyncDB['filesInfo']>(CloudSyncTable.FILES_INFO).put({ projectId: currentProject.getId(), fileId: remoteId })
    Manager.loadProjectById(currentProject.getId())
  }

  protected async clearRemoteId (projectId: string) {
    await CloudSyncBase.DB!.table<ICloudSyncDB['filesInfo']>(CloudSyncTable.FILES_INFO).delete(projectId)
  }

  protected static initDB () {
    if (!CloudSyncBase.DB) {
      CloudSyncBase.DB = new Dexie('CloudSync')
      CloudSyncBase.DB.version(DB_VERSION).stores({
        [CloudSyncTable.ACCOUNTS]: 'service',
        [CloudSyncTable.SYNC_INFO]: 'projectId',
        [CloudSyncTable.FILES_INFO]: 'projectId'
      })
    }
  }

  protected storeDataForService (data: T) {
    return CloudSyncBase.DB!.table<ICloudSyncDB['accounts']>(CloudSyncTable.ACCOUNTS).put({ ...data, service: this.service })
  }

  protected getDataForService (): Promise<ICloudSyncDB['accounts'] | undefined> {
    return CloudSyncBase.DB!.table<ICloudSyncDB['accounts']>(CloudSyncTable.ACCOUNTS).get({ service: this.service })
  }

  public async setLastSync (projectId: string) {
    return CloudSyncBase.DB!.table<ICloudSyncDB['syncInfo']>(CloudSyncTable.SYNC_INFO).put({ projectId, lastSync: DateTools.getUtcIsoString() })
  }

  public async getLastSync (projectId: string): Promise<string | undefined> {
    return (await CloudSyncBase.DB!.table<ICloudSyncDB['syncInfo']>(CloudSyncTable.SYNC_INFO).get({ projectId }))?.lastSync
  }
}
