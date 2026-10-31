import { useEffect, useRef } from 'react'
import { useAtomValue } from 'jotai'
import { WordPressSync } from 'app/libs/cloud-sync/wordpress/wordpress-sync.class'
import { DropboxSync } from 'app/libs/cloud-sync/dropbox/dropbox-sync.class'
import { DROPBOX_REMOTE_ID } from 'app/libs/cloud-sync/dropbox/dropbox.const'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { SyncStateAtoms } from 'app/state/sync/sync-state.atoms'
import { Bucket } from 'app/state/bucket.state'
import type { FC } from 'react'

const CURRENT_PROJECT_CHECK_INTERVAL_MS = 60 * 1000
const REMOTES_SYNC_INTERVAL_MS = 5 * 60 * 1000

const canSyncNow = (): boolean => !document.hidden && navigator.onLine

const isDropboxWritable = (): boolean => {
  const account = Bucket.general.get(SyncStateAtoms.dropboxAccount)
  return !!account && !account.needsReauth
}

const syncAllRemotes = () => {
  if (!canSyncNow()) {
    return
  }
  Bucket.general.get(SyncStateAtoms.wordPressRemotes)
    .filter(remote => !remote.needsReauth)
    .forEach(remote => {
      WordPressSync.syncRemote(remote.remoteId)
    })
  if (isDropboxWritable()) {
    DropboxSync.syncAccount()
  }
}

const MIN_CHECK_SPACING_MS = 15 * 1000
let lastProjectCheck = 0

const syncCurrentProject = () => {
  if (!canSyncNow() || Date.now() - lastProjectCheck < MIN_CHECK_SPACING_MS) {
    return
  }
  lastProjectCheck = Date.now()
  WordPressSync.syncCurrentProjectIfNeeded()
  DropboxSync.syncCurrentProjectIfNeeded()
}

/**
 * Keeps the connected WordPress sites, the Dropbox account and the current project in sync while the app is open:
 * at start, when the current project changes, periodically, and when the window gets focus or the device goes back
 * online. Renders nothing.
 *
 * @feature sync.automatic
 * @title Automatic sync and working offline
 * @summary Syncs Dropbox, the connected WordPress sites and the open project by itself while Anita is open, and keeps the changes on the device while offline.
 * @where Nothing to open: it runs in the background whenever Anita is open in a browser tab.
 * @usage Nothing to do: keep working, also offline. Use "Sync now" to sync immediately.
 * @options none
 * @rules Syncs at start, when a service is connected or a login is renewed, when a project is opened, every 5 minutes for the list of projects of each service, every minute (and when the window gets focus, at most every 15 seconds) for changes to the open project, and when the device goes back online. Nothing is synced while the tab is hidden or the device is offline, and services that need a new login are skipped. Changes made offline are kept on this device and sent at the next sync. Messages: "Anita could not reach Dropbox. Your changes are kept on this device and will be synced when Dropbox is reachable again."; "Anita could not reach <site>. Your changes are kept on this device and will be synced when the site is reachable again."
 * @errors dropbox.network, wordpress.network
 * @status beta
 * @since 1.0.0
 * @related sync.status, sync.dropbox-projects, sync.wordpress-projects
 */
export const CloudSyncAgent: FC = () => {
  const remotesIds = useAtomValue(SyncStateAtoms.wordPressRemotesIds)
  const dropboxAccount = useAtomValue(SyncStateAtoms.dropboxAccount)
  const dropboxIsWritable = !!dropboxAccount && !dropboxAccount.needsReauth
  const projectSystemData = useAtomValue(ProjectAtoms.currentSystemData)
  const projectId = projectSystemData?._settings?.[0]?.id
  const remoteStorage = projectSystemData?._settings?.[0]?.remoteStorage
  const syncedRemotes = useRef(new Set<string>())

  // Each connected site is synced once when it appears (app start, new connection).
  useEffect(() => {
    remotesIds.forEach((remoteId) => {
      if (!syncedRemotes.current.has(remoteId)) {
        syncedRemotes.current.add(remoteId)
        const remote = Bucket.general.get(SyncStateAtoms.wordPressRemotes).find(entry => entry.remoteId === remoteId)
        if (remote && !remote.needsReauth) {
          WordPressSync.syncRemote(remoteId)
        }
      }
    })
  }, [remotesIds])

  // Dropbox is synced when it becomes usable: app start, new connection, login renewed.
  useEffect(() => {
    if (dropboxIsWritable) {
      DropboxSync.syncAccount()
    }
  }, [dropboxIsWritable])

  // Projects linked to Dropbox by older versions are marked as such, also when Dropbox is not connected here.
  useEffect(() => {
    DropboxSync.adoptLegacyLinks()
  }, [])

  useEffect(() => {
    if (!projectId || !remoteStorage) {
      return
    }
    if (remoteStorage === DROPBOX_REMOTE_ID) {
      DropboxSync.syncProject(projectId)
    } else {
      WordPressSync.syncProject(projectId)
    }
  }, [projectId, remoteStorage])

  useEffect(() => {
    const projectInterval = setInterval(syncCurrentProject, CURRENT_PROJECT_CHECK_INTERVAL_MS)
    const remotesInterval = setInterval(syncAllRemotes, REMOTES_SYNC_INTERVAL_MS)
    const onBackOnline = () => {
      syncAllRemotes()
      syncCurrentProject()
    }
    window.addEventListener('online', onBackOnline)
    window.addEventListener('focus', syncCurrentProject)
    return () => {
      clearInterval(projectInterval)
      clearInterval(remotesInterval)
      window.removeEventListener('online', onBackOnline)
      window.removeEventListener('focus', syncCurrentProject)
    }
  }, [])

  return null
}
