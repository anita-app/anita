import { LOCAL_STORAGE_SYSTEMS } from 'app/data/local-dbs/local-storage-systems.enum'
import { CloudSyncState } from 'app/libs/cloud-sync/cloud-sync.const'

export class SyncInfo {
  private cloudSyncState: CloudSyncState | null = null
  private linkedFileId: string | null = null
  private localStorage: LOCAL_STORAGE_SYSTEMS | null = null

  public getCloudSyncState = (): CloudSyncState | null => this.cloudSyncState

  public getLinkedFileId = (): string | null => this.linkedFileId

  public getLocalStorage = (): LOCAL_STORAGE_SYSTEMS | null => this.localStorage

  public setCloudSyncState = (cloudSyncState: CloudSyncState | null): void => {
    this.cloudSyncState = cloudSyncState
  }

  public setLinkedFileId = (linkedFileId: string | null): void => {
    this.linkedFileId = linkedFileId
  }

  public setLocalStorage = (localStorage: LOCAL_STORAGE_SYSTEMS | null): void => {
    this.localStorage = localStorage
  }
}
