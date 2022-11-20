import { TAnitaUniversalDataStorage } from 'app/models/project/project.declarations'
import { DbConnectorInstance } from 'app/libs/db-connector/models/executers'
import { FsHelper } from 'app/libs/db-connector/plugins/file-handles/helpers/fs-helper'

/**
 * Saves the `AnitaUniversalDataStorage` to the file a file on disk by using the fileHandle stored in this.dbConnector.options.projectInfo.fileHandle.
 *
 * @see SaveProjectSettingsInIndexedDB
 */
export class ProjectFileHandleSaver {
  /**
   * The string data to sabe in the file on disk
   */
  private data: string = ''

  /**
   * Creates an instance of project file handle saver.
   * @param projectData full data of the project to be saved
   */
  constructor (
    private dbConnector: DbConnectorInstance<TAnitaUniversalDataStorage>
  ) { }

  /**
   * Saves the project both on file and in IndexedDB
   */
  public async save (): Promise<void> {
    this.setData()
    await this.saveDataToDisk()
  }

  /**
   * Converts the project data to string
   */
  private setData (): void {
    this.data = JSON.stringify(this.dbConnector.dbStore.db, null, 2)
  }

  /**
   * Actually saves the data to disk by calling writeFile
   *
   * @see FsHelper.writeFile
   */
  private saveDataToDisk (): Promise<void> {
    return FsHelper.writeFile(this.dbConnector.options.projectInfo!.fileHandle!, this.data)
  }
}
