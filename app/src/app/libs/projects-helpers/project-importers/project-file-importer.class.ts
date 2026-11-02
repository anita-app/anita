import fileDialog from 'file-dialog'
import { LocalFileHelper } from 'app/libs/cloud-sync/local-file/local-file-helper.class'
import { isLocalFileSyncSupported } from 'app/libs/cloud-sync/local-file/local-file.const'
import type { TAnitaUniversalDataStorage } from 'app/models/project/project.declarations'

/**
 * A file chosen for import that has no content (often a file of a cloud folder not downloaded to this computer),
 * or that the browser could not read.
 * @featurePart import.file
 */
export class ProjectFileReadError extends Error {
  constructor (
    public reason: 'empty' | 'unreadable',
    public fileName: string,
  ) {
    super(`${fileName}: ${reason}`)
    this.name = 'ProjectFileReadError'
  }
}

/**
 * Reads the text of a file, telling apart files that cannot be read and empty files.
 */
const readText = async (getFile: () => Promise<File>, fileName: string): Promise<string> => {
  let text: string
  try {
    text = await (await getFile()).text()
  } catch {
    throw new ProjectFileReadError('unreadable', fileName)
  }
  if (!text.trim()) {
    throw new ProjectFileReadError('empty', fileName)
  }
  return text
}

/**
 * Imports an existing project file from disk.
 *
 * @featurePart import.file, import.file-sync
 */
export class ProjectFileImporter {
  /**
   * Asks for the file to import and returns the project data, or nothing if the user cancels. Where the browser
   * supports it, the file is chosen with the File System Access API, and its handle is returned too, so that the
   * project can be kept in sync with it.
   * Throws ProjectFileReadError if the file is empty or cannot be read, SyntaxError if it is not valid JSON.
   */
  public async import (): Promise<{ project: TAnitaUniversalDataStorage; fileHandle?: FileSystemFileHandle } | void> {
    if (isLocalFileSyncSupported()) {
      const fileHandle = await LocalFileHelper.pickExistingFile()
      if (!fileHandle) {
        return
      }
      const fileContents = await readText(() => fileHandle.getFile(), fileHandle.name)
      return { project: JSON.parse(fileContents), fileHandle }
    }

    const files = await fileDialog({ multiple: false, accept: 'application/json,text/json' })
    if (!files?.length) {
      return
    }
    const fileContents = await readText(() => Promise.resolve(files[0]), files[0].name)
    return { project: JSON.parse(fileContents) }
  }
}
