import { atom } from 'jotai'
import type { IWordPressRemoteInfo } from 'app/libs/cloud-sync/wordpress/wordpress.const'
import type { IDropboxAccountState, IDropboxFileLink } from 'app/libs/cloud-sync/dropbox/dropbox.const'

/**
 * @feature sync.status
 * @title Sync status and problems
 * @summary Shows whether Dropbox, each WordPress site and the open project are synced, syncing, waiting for a login or failed, and what was resolved in the last sync.
 * @where Header: the Dropbox icon and one icon per connected site (tooltip and colored ring), opening Storage and sync. Storage and sync: "Status" of each card. Project page: "Last sync", "Sync problem" and "Synced" notes.
 * @usage Look at the header icons; hover them for the status; click them to open Storage and sync. On the project page read "Last sync" and click "Sync now" to sync right away.
 * @options none
 * @rules Header tooltips: "<service>: synced", "<service>: syncing…" (blue pulsing ring), "<service>: last sync failed" (orange ring), "<service>: log in again to resume syncing" (red ring). Card status: "Connected", "Syncing…", "Synced on <date, time>", "Login required", with the alert "Last sync failed" or "Log in again to resume syncing". Project page: "Not synced yet", "Syncing…" or the date of the last sync, plus "some changes are not synced yet" when local changes are waiting; "Sync problem" shows the message of the last failure; "Synced" reports the records changed on both sides, of which the most recent version was kept. "Sync now" is hidden while a login is required.
 * @errors none
 * @status beta
 * @since 1.0.0
 * @routes remotes
 * @related sync.automatic, sync.dropbox-projects, sync.wordpress-projects, security.sync-sessions
 */
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

/** @internal */
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
