import { useEffect, useRef } from 'react'
import { useAtomValue } from 'jotai'
import { WordPressSync } from 'app/libs/cloud-sync/wordpress/wordpress-sync.class'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { SyncStateAtoms } from 'app/state/sync/sync-state.atoms'
import { Bucket } from 'app/state/bucket.state'
import type { FC } from 'react'

const CURRENT_PROJECT_CHECK_INTERVAL_MS = 60 * 1000
const REMOTES_SYNC_INTERVAL_MS = 5 * 60 * 1000

const syncAllRemotes = () => {
  if (document.hidden || !navigator.onLine) {
    return
  }
  Bucket.general.get(SyncStateAtoms.wordPressRemotes)
    .filter(remote => !remote.needsReauth)
    .forEach(remote => {
      WordPressSync.syncRemote(remote.remoteId)
    })
}

const MIN_CHECK_SPACING_MS = 15 * 1000
let lastProjectCheck = 0

const syncCurrentProject = () => {
  if (document.hidden || !navigator.onLine || Date.now() - lastProjectCheck < MIN_CHECK_SPACING_MS) {
    return
  }
  lastProjectCheck = Date.now()
  WordPressSync.syncCurrentProjectIfNeeded()
}

/**
 * Keeps WordPress sites and the current project in sync while the app is open: at start, when the current
 * project changes, periodically, and when the window gets focus or the device goes back online. Renders nothing.
 */
export const WordPressSyncAgent: FC = () => {
  const remotesIds = useAtomValue(SyncStateAtoms.wordPressRemotesIds)
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

  useEffect(() => {
    if (projectId && remoteStorage) {
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
