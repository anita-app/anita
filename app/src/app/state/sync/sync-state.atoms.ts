import { atom } from 'jotai'
import type { IWordPressRemoteInfo } from 'app/libs/cloud-sync/wordpress/wordpress.const'
import type { IDropboxAccountState, IDropboxFileLink } from 'app/libs/cloud-sync/dropbox/dropbox.const'

export interface ISyncStatus {
  isSyncing: boolean
  /** Message of the last failed sync, cleared by the next successful one. */
  error?: string
  /** Time of the last successful sync. */
  lastSync?: string
  /** Some local changes could not be sent yet. */
  pendingChanges?: boolean
  /** Information about the last sync, e.g. conflicts that were resolved. */
  notice?: string
}

export class SyncStateAtoms {
  public static isSyncing = atom<boolean>(false)
  public static isSavingInFs = atom<boolean>(false)
  public static lastSyncedId = atom<string | null>(null)
  public static wordPressRemotes = atom<Array<IWordPressRemoteInfo>>([])
  public static wordPressRemotesIds = atom<Array<string>>((get) => get(SyncStateAtoms.wordPressRemotes).map(remote => remote.remoteId))
  /** The Dropbox account connected on this device, if any. */
  public static dropboxAccount = atom<IDropboxAccountState | null>(null)
  /** The Dropbox file each project is synced with, by project id. */
  public static dropboxLinks = atom<Record<string, IDropboxFileLink>>({})
  /** Sync status of each WordPress site, by remote id, and of Dropbox (DROPBOX_REMOTE_ID). */
  public static remotesStatus = atom<Record<string, ISyncStatus>>({})
  /** Sync status of each project synced with a WordPress site or with Dropbox, by project id. */
  public static projectsStatus = atom<Record<string, ISyncStatus>>({})
}
