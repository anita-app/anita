import { CloudSyncState } from 'app/libs/cloud-sync/cloud-sync.const'
import { RemoteAndLocalMerger } from 'app/libs/cloud-sync/remote-and-local-merger.class'
import { IS_SYNCING } from 'app/libs/cloud-sync/sync-manager.const'
import { CURRENT_PROJECT } from 'app/libs/manager/manager.const'

export class SyncManager {
  public static syncWithRemoteIfSet = async (): Promise<void> => {
    if (SyncManager.canStartSyncWithRemote()) {
      new RemoteAndLocalMerger(CURRENT_PROJECT.store?.syncInfo.getLinkedFileId()!).sync()
    }
  }

  private static canStartSyncWithRemote = (): boolean => (
    !IS_SYNCING.getValue() &&
    CURRENT_PROJECT.store?.syncInfo.getCloudSyncState() === CloudSyncState.LINKED &&
    !!CURRENT_PROJECT.store?.syncInfo.getLinkedFileId()
  )
}
