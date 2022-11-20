import { CloudSyncState } from 'app/libs/cloud-sync/cloud-sync.const'
import { CURRENT_PROJECT_SYNC_INFO, IS_SYNCING } from 'app/libs/cloud-sync/sync-manager.const'

export class SyncManager {
  public static canStartSync = (): boolean => (
    !IS_SYNCING.getValue() &&
    CURRENT_PROJECT_SYNC_INFO.cloudSyncState === CloudSyncState.LINKED &&
    !!CURRENT_PROJECT_SYNC_INFO.linkedFileId
  )
}
