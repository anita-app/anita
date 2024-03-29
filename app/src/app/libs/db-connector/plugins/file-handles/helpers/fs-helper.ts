import {
  FileSystemDirectoryHandle,
  FileSystemFileHandle,
  FileSystemWriteChunkType,
  WindowFS
} from 'app/libs/db-connector/plugins/file-handles/helpers/file-system-access-api'
import { Logger } from 'app/libs/logger/logger.class'

declare const window: WindowFS

export class FsHelper {
  /**
   * Number of retries to attempt to write to a file.
   * Used to retry when the error is a state changed exception.
   */
  private static writeFileTries: number = 0

  /**
   * Creates a file on the fly and prompts the user to save it
   */
  public static download (content: string, fileName: string, contentType: 'text/plain'): void {
    const a = document.createElement('a')
    const file = new Blob([content], { type: contentType })
    a.href = URL.createObjectURL(file)
    a.download = fileName
    a.click()
  }

  /**
   * Open a handle to an existing file on the local file system.
   */
  public static getFileHandle (): Promise<Array<FileSystemFileHandle>> {
    return window.showOpenFilePicker({ multiple: false })
  }

  /**
   * Open a handle to an existing file on the local file system.
   */
  public static getDirectoryHandle (): Promise<FileSystemDirectoryHandle> {
    return window.showDirectoryPicker()
  }

  /**
   * Reads the file content from a fileHandle and returns it as a string.
   */
  public static async readFileHandleAsText (fileHandle: FileSystemFileHandle): Promise<string> {
    try {
      const file = await fileHandle.getFile() as any // as any because .text not yet documented in TS
      return file.text()
    } catch (error: unknown) {
      Logger.error('[FsHelper.readFileHandleAsText]', (error as Error)?.message)
      return ''
    }
  }

  /**
   * Reads the file content from a fileHandle and returns it as a Uint8Array.
   */
  public static async readDirFileAsUint8Array (dirHandle: FileSystemDirectoryHandle, fileName: string): Promise<Uint8Array> {
    const fileHandle = await dirHandle.getFileHandle(fileName, { create: true })
    const file = await fileHandle.getFile()
    const arrayBuffer = await file.arrayBuffer()
    return new Uint8Array(arrayBuffer)
  }

  /**
   * Create a handle to a new (text) file on the local file system.
   */
  public static getNewFileHandle (
    name = '',
    description = 'Anita project data file',
    accept: { [mimeType: string]: Array<string> } = { 'application/json': ['.json'] }
  ): Promise<FileSystemFileHandle> {
    const opts = {
      types: [{
        name,
        description,
        accept
      }]
    }
    return window.showSaveFilePicker(opts)
  }

  /**
   * Reads the raw text from a file.
   */
  public static readFile (file: any): Promise<string> {
    // If the new .text() reader is available, use it.
    if (file.text) {
      return file.text()
    }
    // Otherwise use the traditional file reading technique.
    return FsHelper._readFileLegacy(file) as Promise<string>
  }

  /**
   * Reads the raw text from a file.
   */
  private static _readFileLegacy (file: any): Promise<string> {
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.addEventListener('loadend', e => {
        const text = e.target!.result
        resolve(text as string)
      })
      reader.readAsText(file)
    })
  }

  /**
   * Writes the contents to disk.
   */
  public static async writeFile (fileHandle: FileSystemFileHandle, contents: FileSystemWriteChunkType): Promise<void> {
    this.writeFileTries = 0
    await this.doWriteFile(fileHandle, contents)
  }

  public static async doWriteFile (fileHandle: FileSystemFileHandle, contents: FileSystemWriteChunkType): Promise<void> {
    this.writeFileTries++
    try {
      // For Chrome 83 and later.
      // Create a FileSystemWritableFileStream to write to.
      const writable = await fileHandle.createWritable({ keepExistingData: true })
      // Write the contents of the file to the stream.
      writable.truncate(0)
      await writable.write(contents)
      // Close the file and write the contents to disk.
      await writable.close()
    } catch (error: unknown) {
      Logger.error('[FSHelper.writeFile]', (error as Error)?.message)
      if ((error as Error)?.message?.includes('state cached in an interface object was made but the state had changed since it was read from disk')) {
        if (this.writeFileTries < 3) {
          await this.doWriteFile(fileHandle, contents)
        }
      }
    }
  }

  /**
   * Verify the user has granted permission to read or write to the file, if
   * permission hasn't been granted, request permission.
   */
  public static async verifyPermission (fileHandle: FileSystemFileHandle, withWrite: boolean): Promise<boolean> {
    const opts = {} as any
    if (withWrite) {
      opts.writable = true
      opts.mode = 'readwrite'
    }
    // Check if we already have permission, if so, return true.
    if (await fileHandle.queryPermission(opts) === 'granted') {
      return true
    }
    // Request permission to the file, if the user grants permission, return true.
    if (await fileHandle.requestPermission(opts) === 'granted') {
      return true
    }
    // The user did nt grant permission, return false.
    return false
  }
}
