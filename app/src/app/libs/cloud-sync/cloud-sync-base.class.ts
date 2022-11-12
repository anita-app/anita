import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { CLIENT_SECTIONS } from 'app/data/system-local-db/client-sections.enum'
import { Manager } from 'app/libs/manager/manager.class'
import { LocalProjectSettings, RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import Dexie from 'dexie'
import { IDropboxTokens } from './cloud-sync.const'

const DB_VERSION = 1

export enum SupportedCloud {
  DROPBOX = 'dropbox'
}

export class CloudSyncBase<T extends IDropboxTokens = IDropboxTokens> {
  private static DB: Dexie | undefined
  constructor (
    private service: SupportedCloud
  ) { }

  public async isLinked (projectId: string | undefined): Promise<boolean> {
    if (!projectId) {
      return false
    }
    const project = await dbInstances.system.callSelector<LocalProjectSettings>(CLIENT_SECTIONS.projects, { id: projectId }).single()
    return !!project?.cloudSync?.[this.service!]
  }

  public static getDB (): Dexie {
    if (!CloudSyncBase.DB) {
      CloudSyncBase.initDB()
    }
    return CloudSyncBase.DB!
  }

  protected async setRemoteFileId (remoteId: string) {
    const project = Manager.getCurrentProject()
    if (!project) {
      return
    }
    const systemData = project.getSystemData()
    if (!systemData[RESERVED_AUDS_KEYS._settings][0].cloudSync) {
      systemData[RESERVED_AUDS_KEYS._settings][0].cloudSync = {}
    }

    systemData[RESERVED_AUDS_KEYS._settings][0].cloudSync = {
      [this.service]: remoteId
    }
    project.saveProject()
  }

  protected static initDB () {
    CloudSyncBase.DB = new Dexie('CloudSync')
    CloudSyncBase.DB.version(DB_VERSION).stores({
      accounts: 'service'
    })
  }

  protected storeDataForService (data: T) {
    return CloudSyncBase.DB!.table('accounts').put({ ...data, service: this.service })
  }

  protected getDataForService (): Promise<T | undefined> {
    return CloudSyncBase.DB!.table('accounts').get({ service: this.service })
  }
}
