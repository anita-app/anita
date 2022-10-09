import Dexie from 'dexie'
import { IDropboxTokens } from './cloud-sync.const'

const DB_VERSION = 1

export enum SupportedCloud {
  DROPBOX = 'dropbox'
}

export class CloudSyncBase<T extends IDropboxTokens = IDropboxTokens> {
  protected DB: Dexie | undefined

  protected async initDB () {
    this.DB = new Dexie('CloudSync')
    this.DB.version(DB_VERSION).stores({
      accounts: 'service'
    })
  }

  protected storeDataForService (service: SupportedCloud, data: T) {
    return this.DB!.table('accounts').put({ ...data, service })
  }

  protected getDataForService (service: SupportedCloud): Promise<T | undefined> {
    return this.DB!.table('accounts').get({ service })
  }
}
