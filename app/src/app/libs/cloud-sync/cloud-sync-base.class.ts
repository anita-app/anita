import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { CLIENT_SECTIONS } from 'app/data/system-local-db/client-sections.enum'
import { LocalProjectSettings } from 'app/models/project/project.declarations'
import Dexie from 'dexie'
import { IDropboxTokens } from './cloud-sync.const'

const DB_VERSION = 1

export enum SupportedCloud {
  DROPBOX = 'dropbox'
}

export class CloudSyncBase<T extends IDropboxTokens = IDropboxTokens> {
  protected DB: Dexie | undefined
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

  protected async initDB () {
    this.DB = new Dexie('CloudSync')
    this.DB.version(DB_VERSION).stores({
      accounts: 'service'
    })
  }

  protected storeDataForService (data: T) {
    return this.DB!.table('accounts').put({ ...data, service: this.service })
  }

  protected getDataForService (): Promise<T | undefined> {
    return this.DB!.table('accounts').get({ service: this.service })
  }
}
