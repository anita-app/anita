import { dbInstances } from '@anita/client/data/db-instances.const';
import {
  AnitaUniversalDataStorage,
  LocalProjectSettings,
  ProjectSettings,
  RESERVED_UDS_KEYS
  } from '@anita/client/data/model/project-info';
import { DbConnector } from '@anita/client/libs/db-connector/db-connector.class';
import { FILE_HANDLES_PLUGIN } from '@anita/client/libs/db-connector/plugins/file-handles/exporter.constant';
import { FileSystemFileHandle } from '@anita/client/libs/db-connector/plugins/file-handles/helpers/file-system-access-api';
import { getFileHandle, readFileHandleAsText } from '@anita/client/libs/db-connector/plugins/file-handles/helpers/fs-helper';
import { REDUCER_ACTIONS } from '@anita/client/libs/ng-rx/ngrx-actions.const';
import { CurrentProjectSetter } from '@anita/client/libs/projects-helpers/project-handlers/current-project-setter.class';
import { SaveProjectSettingsInIndexedDB } from '@anita/client/libs/projects-helpers/project-handlers/save-project-settings-in-indexeddb.class';
import { asyncForEach } from '@anita/client/libs/tools/tools';
import { stateData } from '@anita/client/ng-services/state-data/state-data.constant';

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
  private fileHandles: Array<FileSystemFileHandle>;
  /**
   * The file contents of each project to import
   */
  private fileContents: string;
  /**
   * The project data of each project to import
   */
  private projectData: AnitaUniversalDataStorage;

  private localProjectSettings: LocalProjectSettings;

  /**
   * Asks for the files to import and processes them, then sets the current project as the last one imported 
   */
  public async import(): Promise<void> {
    await this.askForFile();
    await this.processFileHandles();
    await this.initializeDb();
    new CurrentProjectSetter(this.projectData[RESERVED_UDS_KEYS._settings], this.projectData[RESERVED_UDS_KEYS._sections]).set();
  }

  /**
   * Asks for user permission to open a file
   */
  private async askForFile(): Promise<void> {
    this.fileHandles = await getFileHandle();
  }

  /**
   * For each file selected by the user, starts the import logic 
   */
  private async processFileHandles(): Promise<void> {
    await asyncForEach(this.fileHandles, async fileHandle => await this.processFileHandle(fileHandle));
  }

  /**
   * Saves the project settings in IndexedDB and adds the project to the project list 
   */
  private async processFileHandle(fileHandle: FileSystemFileHandle): Promise<void> {
    this.fileContents = await readFileHandleAsText(fileHandle);
    this.parseFileContents();
    this.localProjectSettings = await new SaveProjectSettingsInIndexedDB(this.projectData[RESERVED_UDS_KEYS._settings][0], fileHandle).save();
    this.dispatchProject(this.projectData[RESERVED_UDS_KEYS._settings][0]);
  }

  /**
   * Converts the string of the project to the type `AnitaUniversalDataStorage`
   */
  private parseFileContents(): void {
    this.projectData = JSON.parse(this.fileContents);
  }

  /**
   * Initialize the DbConnector instance
   */
  private async initializeDb(): Promise<void> {
    dbInstances[this.projectData[RESERVED_UDS_KEYS._settings][0].id] = await new DbConnector([], FILE_HANDLES_PLUGIN, { projectInfo: this.localProjectSettings }).init();
  }

  /**
   * Dispatches the action to add the project to the list of projects
   */
  private dispatchProject(payload: ProjectSettings): void {
    stateData.ngRxStore.dispatch(REDUCER_ACTIONS.addProjectToList({ payload }));
  }

}
