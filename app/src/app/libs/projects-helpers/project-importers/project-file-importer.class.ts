import { AnitaUniversalDataStorage } from 'app/data/project-structure/project-info'
import { FileSystemFileHandle } from 'app/libs/db-connector/plugins/file-handles/helpers/file-system-access-api'
import { FsHelper } from 'app/libs/db-connector/plugins/file-handles/helpers/fs-helper'
import fileDialog from 'file-dialog'

/**
 * Imports one or more existing project files, and then calls `SaveProjectSettingsInIndexedDB`.
 * Also sets the last imported project as the current one by calling `CurrentProjectSetter`.
 *
 * @see SaveProjectSettingsInIndexedDB
 * @see CurrentProjectSetter
 */
export class ProjectFileImporter {
  /**
   * List of FileSystemFileHandle for each project to import
   */
  private fileHandle: FileSystemFileHandle | undefined
  /**
   * The file contents of each project to import
   */
  private fileContents: string | undefined
  /**
   * The project data of each project to import
   */
  private projectData: AnitaUniversalDataStorage | undefined

  /**
   * Asks for the files to import and processes them, then sets the current project as the last one imported
   */
  public async import (): Promise<{ project: AnitaUniversalDataStorage, fileHandle: FileSystemFileHandle } | void> {
    if (typeof window.showOpenFilePicker === 'function') {
      await this.askForFileHandle()
    } else {
      await this.importFromFile()
    }

    if (!this.fileContents) {
      return
    }

    this.parseFileContents()
    return { project: this.projectData!, fileHandle: this.fileHandle! }
  }

  /**
   * Asks for user permission to open a file with File System Access API
   */
  private async askForFileHandle (): Promise<void> {
    const fileHandles = await FsHelper.getFileHandle()
    this.fileHandle = fileHandles[0]
    this.fileContents = await FsHelper.readFileHandleAsText(this.fileHandle)
  }

  /**
   * Asks  for a file with file-dialog
   */
  public async importFromFile (): Promise<void> {
    const files = await fileDialog({ multiple: false, accept: 'text/json' })
    this.fileContents = await files[0].text()
  }

  /**
   * Converts the string of the project to the type `AnitaUniversalDataStorage`
   */
  private parseFileContents (): void {
    this.projectData = JSON.parse(this.fileContents!)
  }
}
