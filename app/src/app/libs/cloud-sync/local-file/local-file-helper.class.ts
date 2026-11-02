import { liveQuery } from 'dexie'
import { CloudSyncBase } from 'app/cross-refs-exports'
import { parseProjectFile } from 'app/libs/cloud-sync/dropbox/dropbox-files.function'
import { LocalFileErrorCode, LocalFileSyncError } from 'app/libs/cloud-sync/local-file/local-file-error.class'
import { isLocalFileSyncSupported } from 'app/libs/cloud-sync/local-file/local-file.const'
import { localFileContent, localFileNameForProject } from 'app/libs/cloud-sync/local-file/local-file.function'
import { SyncState } from 'app/state/sync/sync-state.class'
import type { TAnitaUniversalDataStorage } from 'app/models/project/project.declarations'

const FILE_TYPES: Array<IFilePickerAcceptType> = [{ description: 'Anita project', accept: { 'application/json': ['.json'] } }]
/** The pickers open in the last folder used for Anita projects. */
const PICKER_ID = 'anita-projects'

/** @internal */
export interface ILocalFileContent {
  /** The project in the file, or null if the file is empty. */
  data: TAnitaUniversalDataStorage | null
  lastModified: number
  name: string
}

/** @internal */
export type TLocalFilePermission = 'granted' | 'prompt' | 'denied'

const isAbort = (error: unknown): boolean => (error as { name?: string } | undefined)?.name === 'AbortError'

/**
 * Reads and writes project files on this computer with the File System Access API.
 * @internal
 */
export class LocalFileHelper {
  public static init (): void {
    liveQuery(() => CloudSyncBase.getLocalFileLinks())
      .subscribe((links) => {
        SyncState.setLocalFileLinks(links)
      })
  }

  /**
   * Asks the user where to save a new file. Must be called from a click. Returns null if the user cancels.
   */
  public static async pickNewFile (projectTitle: string | undefined): Promise<FileSystemFileHandle | null> {
    if (!isLocalFileSyncSupported()) {
      throw new LocalFileSyncError(LocalFileErrorCode.unsupported, 'File System Access API not available')
    }
    try {
      return await window.showSaveFilePicker!({ suggestedName: localFileNameForProject(projectTitle), types: FILE_TYPES, id: PICKER_ID })
    } catch (error) {
      if (isAbort(error)) {
        return null
      }
      throw LocalFileSyncError.from(error)
    }
  }

  /**
   * Asks the user to choose an existing file. Must be called from a click. Returns null if the user cancels.
   */
  public static async pickExistingFile (): Promise<FileSystemFileHandle | null> {
    if (!isLocalFileSyncSupported()) {
      throw new LocalFileSyncError(LocalFileErrorCode.unsupported, 'File System Access API not available')
    }
    try {
      const [handle] = await window.showOpenFilePicker!({ multiple: false, types: FILE_TYPES, id: PICKER_ID })
      return handle ?? null
    } catch (error) {
      if (isAbort(error)) {
        return null
      }
      throw LocalFileSyncError.from(error)
    }
  }

  /**
   * Whether Anita can read and write the file now, without asking.
   */
  public static async queryPermission (handle: FileSystemFileHandle): Promise<TLocalFilePermission> {
    if (typeof handle.queryPermission !== 'function') {
      return 'granted'
    }
    return handle.queryPermission({ mode: 'readwrite' })
  }

  /**
   * Asks the user to allow Anita to read and write the file. Must be called from a click.
   * Chromium-based browsers can remember the choice ("Allow on every visit").
   */
  public static async requestPermission (handle: FileSystemFileHandle): Promise<boolean> {
    if (await LocalFileHelper.queryPermission(handle) === 'granted') {
      return true
    }
    if (typeof handle.requestPermission !== 'function') {
      return false
    }
    try {
      return await handle.requestPermission({ mode: 'readwrite' }) === 'granted'
    } catch {
      return false
    }
  }

  public static async getLastModified (handle: FileSystemFileHandle): Promise<number> {
    try {
      return (await handle.getFile()).lastModified
    } catch (error) {
      throw LocalFileSyncError.from(error)
    }
  }

  /**
   * Reads the project in the file. An empty file (just created) has no data; any other content that is not an Anita
   * project is an error, so that the file is never overwritten by mistake.
   */
  public static async read (handle: FileSystemFileHandle): Promise<ILocalFileContent> {
    let file: File
    try {
      file = await handle.getFile()
    } catch (error) {
      throw LocalFileSyncError.from(error)
    }
    const text = await file.text()
    if (!text.trim()) {
      return { data: null, lastModified: file.lastModified, name: handle.name }
    }
    const data = parseProjectFile(text)
    if (!data || Object.values(data).some(records => !Array.isArray(records))) {
      throw new LocalFileSyncError(LocalFileErrorCode.invalidFile, `${handle.name} is not an Anita project.`)
    }
    return { data, lastModified: file.lastModified, name: handle.name }
  }

  /**
   * Writes the whole project in the file. With `expectedLastModified`, fails with a conflict if the file was changed
   * since it was read. Returns the new modification time of the file.
   */
  public static async write (handle: FileSystemFileHandle, data: TAnitaUniversalDataStorage, expectedLastModified?: number): Promise<number> {
    try {
      if (expectedLastModified !== undefined && (await handle.getFile()).lastModified !== expectedLastModified) {
        throw new LocalFileSyncError(LocalFileErrorCode.conflict, `${handle.name} was changed while syncing.`)
      }
      const writable = await handle.createWritable()
      await writable.write(localFileContent(data))
      await writable.close()
      return (await handle.getFile()).lastModified
    } catch (error) {
      throw LocalFileSyncError.from(error)
    }
  }
}
