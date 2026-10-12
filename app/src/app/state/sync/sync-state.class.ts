import { Bucket } from 'app/state/bucket.state'
import { SyncStateAtoms } from './sync-state.atoms'
import type { ISyncStatus } from './sync-state.atoms'
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
    Bucket.general.set(SyncStateAtoms.wordPressRemotes, remotes)
  }

  public static getWordPressRemote = (remoteId: string): IWordPressRemoteInfo | undefined => (
    Bucket.general.get(SyncStateAtoms.wordPressRemotes).find(remote => remote.remoteId === remoteId)
  )

  public static updateRemoteStatus = (remoteId: string, status: Partial<ISyncStatus>) => {
    const current = Bucket.general.get(SyncStateAtoms.remotesStatus)
    Bucket.general.set(SyncStateAtoms.remotesStatus, { ...current, [remoteId]: { ...{ isSyncing: false }, ...current[remoteId], ...status } })
  }

  public static getProjectStatus = (projectId: string): ISyncStatus | undefined => Bucket.general.get(SyncStateAtoms.projectsStatus)[projectId]

  public static updateProjectStatus = (projectId: string, status: Partial<ISyncStatus>) => {
    const current = Bucket.general.get(SyncStateAtoms.projectsStatus)
    Bucket.general.set(SyncStateAtoms.projectsStatus, { ...current, [projectId]: { ...{ isSyncing: false }, ...current[projectId], ...status } })
  }
}
