import { CloudSyncState } from 'app/libs/cloud-sync/cloud-sync.const'
import { BehaviorSubject } from 'rxjs'

interface ICurrentProjectSyncInfo {
  cloudSyncState: CloudSyncState
  linkedFileId: string | null
}

export const IS_SYNCING = new BehaviorSubject<boolean>(false)

export const CURRENT_PROJECT_SYNC_INFO: ICurrentProjectSyncInfo = {
  cloudSyncState: CloudSyncState.NOT_CONNECTED,
  linkedFileId: null
}
