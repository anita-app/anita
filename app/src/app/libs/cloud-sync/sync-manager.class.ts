/* eslint-disable eqeqeq */
import { LOCAL_STORAGE_SYSTEMS } from 'app/data/local-dbs/local-storage-systems.enum'
import { CloudSyncState } from 'app/libs/cloud-sync/cloud-sync.const'
import { RemoteAndLocalMerger } from 'app/libs/cloud-sync/remote-and-local-merger.class'
import { IS_SAVING_IN_FS, IS_SYNCING } from 'app/libs/cloud-sync/sync-manager.const'
import { Manager } from 'app/libs/manager/manager.class'

export class SyncManager {
  public static syncWithRemoteOrLocal = async (): Promise<void> => {
    if (Manager.getCurrentProject()?.syncInfo.getLocalStorage() == LOCAL_STORAGE_SYSTEMS.IndexedDB) {
      await this.handleRemoteSync()
    } else {
      this.handleLocalSync()
    }
    IS_SAVING_IN_FS.next(false)
  }

  private static handleRemoteSync = (): Promise<void> | undefined => {
    if (SyncManager.canStartSyncWithRemote()) {
      return new RemoteAndLocalMerger(Manager.getCurrentProject()?.syncInfo.getLinkedFileId()!).sync()
    }
  }

  private static handleLocalSync = () => {
    // TODO
  }

  private static canStartSyncWithRemote = (): boolean => (
    !IS_SYNCING.getValue() &&
    Manager.getCurrentProject()?.syncInfo.getCloudSyncState() === CloudSyncState.LINKED &&
    !!Manager.getCurrentProject()?.syncInfo.getLinkedFileId()
  )
}
