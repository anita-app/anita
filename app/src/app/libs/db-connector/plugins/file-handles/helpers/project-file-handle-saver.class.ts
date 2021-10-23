import { AnitaUniversalDataStorage, RESERVED_UDS_KEYS } from '@anita/client/data/model/project-info';
import { DbConnectorInstance } from '@anita/client/libs/db-connector/models/executers';
import { writeFile } from '@anita/client/libs/db-connector/plugins/file-handles/helpers/fs-helper';
import { CurrentProjectSetter } from '@anita/client/libs/projects-helpers/project-handlers/current-project-setter.class';
import { SaveProjectSettingsInIndexedDB } from '@anita/client/libs/projects-helpers/project-handlers/save-project-settings-in-indexeddb.class';
import { ProjectsListLoader } from '@anita/client/libs/projects-helpers/projects-handlers/projects-list-loader.class';

/**
 * Saves the `AnitaUniversalDataStorage` to the file a file on disk by using the fileHandle stored in the IndexedDB, if found, or asking the user to pick a new file.
 * It also calls `SaveProjectSettingsInIndexedDB` to store or overwrite the `LocalProjectSettings` in IndexedDB.
 *
 * @see SaveProjectSettingsInIndexedDB
 */
export class ProjectFileHandleSaver {

  /**
   * The string data to sabe in the file on disk
   */
  private data: string;

  /**
   * Creates an instance of project file handle saver.
   * @param projectData full data of the project to be saved
   */
  constructor(
    private dbConnector: DbConnectorInstance<AnitaUniversalDataStorage>
  ) { }

  /**
   * Saves the project both on file and in IndexedDB
   */
  public async save(): Promise<void> {
    this.setData();
    this.saveDataToDisk();
    await new SaveProjectSettingsInIndexedDB(this.dbConnector.dbStore.db[RESERVED_UDS_KEYS._settings][0], this.dbConnector.options.projectInfo.fileHandle).save();
    await new CurrentProjectSetter(this.dbConnector.dbStore.db[RESERVED_UDS_KEYS._settings], this.dbConnector.dbStore.db[RESERVED_UDS_KEYS._sections]).set();
    await new ProjectsListLoader().load();
  }

  /**
   * Converts the project data to string
   */
  private setData(): void {
    this.data = JSON.stringify(this.dbConnector.dbStore.db);
  }

  /**
   * Actually saves the data to disk by calling writeFile
   * 
   * @see writeFile
   */
  private saveDataToDisk(): void {
    writeFile(this.dbConnector.options.projectInfo.fileHandle, this.data);
  }

}
