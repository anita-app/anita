import { LOCAL_STORAGE_SYSTEMS } from 'app/data/local-dbs/local-storage-systems.enum'
import { CloudSyncState } from 'app/libs/cloud-sync/cloud-sync.const'
import { BehaviorSubject } from 'rxjs'

interface ICurrentProjectSyncInfo {
  cloudSyncState: CloudSyncState | null
  linkedFileId: string | null
  localStorage: LOCAL_STORAGE_SYSTEMS | null
}

export const IS_SYNCING = new BehaviorSubject<boolean>(false)

export const CURRENT_PROJECT_SYNC_INFO: ICurrentProjectSyncInfo = {
  cloudSyncState: null,
  linkedFileId: null,
  localStorage: null
}
