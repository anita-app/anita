/**
 * Value of the `remoteStorage` setting of a project synced with a file on this computer.
 * WordPress sites use their address there, which always contains a dot, so the two never collide.
 * @internal
 */
export const LOCAL_FILE_REMOTE_ID = 'localFile'

/**
 * The file on this computer a project is synced with. The handle is kept in the browser's database: the browser
 * asks the user again for the permission to use it, usually once per visit.
 * @internal
 */
export interface ILocalFileLink {
  projectId: string
  handle: FileSystemFileHandle
  /** Name of the file, as shown to the user. */
  name: string
  /** Last modification time of the file (ms) after the last sync: a different time means it was changed outside Anita. */
  lastModified?: number
}

/**
 * Whether the browser can keep a project in sync with a file on this computer (File System Access API).
 * @internal
 */
export const isLocalFileSyncSupported = (): boolean => (
  typeof window !== 'undefined' && typeof window.showOpenFilePicker === 'function' && typeof window.showSaveFilePicker === 'function'
)
