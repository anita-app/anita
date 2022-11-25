import { CloudSyncState } from 'app/libs/cloud-sync/cloud-sync.const'
import { RemoteAndLocalMerger } from 'app/libs/cloud-sync/remote-and-local-merger.class'
import { IS_SYNCING } from 'app/libs/cloud-sync/sync-manager.const'
import { Manager } from 'app/libs/manager/manager.class'

export class SyncManager {
  public static syncWithRemoteIfSet = async (): Promise<void> => {
    if (SyncManager.canStartSyncWithRemote()) {
      new RemoteAndLocalMerger(Manager.getCurrentProject()?.syncInfo.getLinkedFileId()!).sync()
    }
  }

  private static canStartSyncWithRemote = (): boolean => (
    !IS_SYNCING.getValue() &&
    Manager.getCurrentProject()?.syncInfo.getCloudSyncState() === CloudSyncState.LINKED &&
    !!Manager.getCurrentProject()?.syncInfo.getLinkedFileId()
  )
}
