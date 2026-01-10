import { Bucket } from 'app/state/bucket.state'
import { atom } from 'jotai'
import { SyncStateAtoms } from './sync-state.atoms'
import type { IWordPressRemoteInfo } from 'app/libs/cloud-sync/wordpress/wordpress.const'

export class SyncState {
  public static atoms = SyncStateAtoms

  public static setIsSyncing = (isSyncing: boolean) => {
    Bucket.general.set(SyncStateAtoms.isSyncing, isSyncing)
  }

  public static getIsSyncing = () => Bucket.general.get(SyncStateAtoms.isSyncing)

  public static setIsSavingInFs = (isSavingInFs: boolean) => {
    Bucket.general.set(SyncStateAtoms.isSavingInFs, isSavingInFs)
  }

  public static setLastSyncedId = (lastSyncedId: string | null) => {
    Bucket.general.set(SyncStateAtoms.lastSyncedId, lastSyncedId)
  }

  public static setWordPressRemotes = (remotes: Array<IWordPressRemoteInfo>) => {
    remotes.forEach(remote => {
      if ((!SyncStateAtoms.remoteInfo[remote.remoteId])) {
        SyncStateAtoms.remoteInfo[remote.remoteId] = atom(remote)
      }
      Bucket.general.set(SyncStateAtoms.remoteInfo[remote.remoteId], remote)
    })
  }
}
