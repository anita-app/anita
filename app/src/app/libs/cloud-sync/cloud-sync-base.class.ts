import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { CLIENT_SECTIONS } from 'app/data/system-local-db/client-sections.enum'
import { Manager } from 'app/libs/manager/manager.class'
import { DateTools } from 'app/libs/tools/date-tools.class'
import { LocalProjectSettings } from 'app/models/project/project.declarations'
import { RESERVED_FIELDS } from 'app/models/reserved-fields.constant'
import Dexie from 'dexie'
import { IDropboxTokens } from './cloud-sync.const'

const DB_VERSION = 3

export enum SupportedCloud {
  DROPBOX = 'dropbox'
}

interface IAccountsTable extends IDropboxTokens {
  service: SupportedCloud
}

enum CloudSyncTable {
  ACCOUNTS = 'accounts',
  SYNC_INFO = 'syncInfo'
}

interface ICloudSyncDB {
  [CloudSyncTable.ACCOUNTS]: IAccountsTable
  [CloudSyncTable.SYNC_INFO]: {
    projectId: string
    lastSync: string
  }
}

export class CloudSyncBase<T extends IDropboxTokens = IDropboxTokens> {
  private static DB: Dexie | undefined
  constructor (
    private service: SupportedCloud
  ) { }

  public async getLinkedFileIdOrNull (projectId: string | undefined): Promise<string | null> {
    if (!projectId) {
      return null
    }
    const project = await dbInstances.system.callSelector<LocalProjectSettings>(CLIENT_SECTIONS.projects, { id: projectId }).single()
    return project?.cloudSync?.[this.service!] ?? null
  }

  public static getDB (): Dexie {
    if (!CloudSyncBase.DB) {
      CloudSyncBase.initDB()
    }
    return CloudSyncBase.DB!
  }

  protected async setRemoteId (remoteId: string) {
    const currentProject = Manager.getCurrentProject()

    if (!currentProject) {
      return
    }
    const project = await dbInstances.system.callSelector<LocalProjectSettings>(CLIENT_SECTIONS.projects, { id: currentProject.getId() }).single()

    if (!project) {
      return
    }

    if (!project.cloudSync) {
      project.cloudSync = {}
    }

    project.cloudSync = {
      [this.service]: remoteId
    }
    project[RESERVED_FIELDS.updatedAt] = DateTools.getUtcIsoString()
    await dbInstances.system.callUpdator<LocalProjectSettings>(CLIENT_SECTIONS.projects, project).autoUpdate()
    Manager.loadProjectById(currentProject.getId())
  }

  protected static initDB () {
    CloudSyncBase.DB = new Dexie('CloudSync')
    CloudSyncBase.DB.version(DB_VERSION).stores({
      [CloudSyncTable.ACCOUNTS]: 'service',
      [CloudSyncTable.SYNC_INFO]: 'projectId'
    })
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
