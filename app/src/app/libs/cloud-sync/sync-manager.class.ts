import { CloudSyncState } from 'app/libs/cloud-sync/cloud-sync.const'
import { RemoteAndLocalMerger } from 'app/libs/cloud-sync/remote-and-local-merger.class'
import { CURRENT_PROJECT_SYNC_INFO, IS_SYNCING } from 'app/libs/cloud-sync/sync-manager.const'

export class SyncManager {
  public static syncWithRemoteIfSet = async (): Promise<void> => {
    if (SyncManager.canStartSyncWithRemote()) {
      new RemoteAndLocalMerger(CURRENT_PROJECT_SYNC_INFO.linkedFileId!).sync()
    }
  }

  private static canStartSyncWithRemote = (): boolean => (
    !IS_SYNCING.getValue() &&
    CURRENT_PROJECT_SYNC_INFO.cloudSyncState === CloudSyncState.LINKED &&
    !!CURRENT_PROJECT_SYNC_INFO.linkedFileId
  )
}
