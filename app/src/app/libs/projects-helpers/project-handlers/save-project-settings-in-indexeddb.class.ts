import { CLIENT_SECTIONS } from '@anita/client/data/client-sections.enum';
import { dbInstances } from '@anita/client/data/db-instances.const';
import { LocalProjectSettings, ProjectSettings } from '@anita/client/data/model/project-info';
import { FileSystemFileHandle } from '@anita/client/libs/db-connector/plugins/file-handles/helpers/file-system-access-api';
import cloneDeep from 'lodash.clonedeep';

/**
 * Saves project's settings in IndexedDB.
 */
export class SaveProjectSettingsInIndexedDB {

  /**
   * Copy of the settings of the project to be saved in IndexedDB
   */
  private copyOfProjectSettings: LocalProjectSettings;

  /**
   * Creates an instance of save project settings in indexed db.
   * @param projectSettings settings Object of the project to store
   * @param fileHandle handle of the file on disk. Saved in the IndexedDB for future use
   */
  constructor(
    private projectSettings: ProjectSettings,
    private fileHandle: FileSystemFileHandle
  ) { }

  /**
   * Saves the project settings in IndexedDB with its fileHandle
   * @returns save 
   */
  public async save(): Promise<LocalProjectSettings> {
    this.setProjectSettingsClone();
    this.setFileHandleOnProjectSettingsClone();
    this.doStoreProjectSettings();

    return this.copyOfProjectSettings;
  }

  /**
   * Deep clonse settings and then adds the fileHandle to prevent setting the fileHandle on the project data object
   */
  private setProjectSettingsClone(): void {
    this.copyOfProjectSettings = cloneDeep(this.projectSettings);
  }

  /**
   * Sets the file handle on the project settings clone
   */
  private setFileHandleOnProjectSettingsClone(): void {
    this.copyOfProjectSettings.fileHandle = this.fileHandle;
  }

  /**
   * Stores the project settings with db-connector
   */
  private doStoreProjectSettings(): void {
    dbInstances.system.callInsertor(CLIENT_SECTIONS.projects, this.copyOfProjectSettings).autoInsert();
  }
}
