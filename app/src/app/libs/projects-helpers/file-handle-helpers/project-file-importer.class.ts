import { dbInstances } from 'app/data/db-instances.const';
import {
  AnitaUniversalDataStorage,
  LocalProjectSettings,
  ProjectSettings,
  RESERVED_AUDS_KEYS
  } from 'app/data/project-structure/project-info';
import { DbConnector } from 'app/libs/db-connector/db-connector.class';
import { FILE_HANDLES_PLUGIN } from 'app/libs/db-connector/plugins/file-handles/exporter.constant';
import { FileSystemFileHandle } from 'app/libs/db-connector/plugins/file-handles/helpers/file-system-access-api';
import { getFileHandle, readFileHandleAsText } from 'app/libs/db-connector/plugins/file-handles/helpers/fs-helper';
import { CurrentProjectSetter } from 'app/libs/project-helpers/project-handlers/current-project-setter.class';
import { SaveProjectSettingsInIndexedDB } from 'app/libs/project-helpers/project-handlers/save-project-settings-in-indexeddb.class';
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const';
import { store } from 'app/libs/redux/state.store';
import { asyncForEach } from 'app/libs/tools/tools';

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
    new CurrentProjectSetter(this.projectData[RESERVED_AUDS_KEYS._settings], this.projectData[RESERVED_AUDS_KEYS._sections]).set();
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
    this.localProjectSettings = await new SaveProjectSettingsInIndexedDB(this.projectData[RESERVED_AUDS_KEYS._settings][0], fileHandle).save();
    this.dispatchProject(this.projectData[RESERVED_AUDS_KEYS._settings][0]);
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
    dbInstances[this.projectData[RESERVED_AUDS_KEYS._settings][0].id] = await new DbConnector(FILE_HANDLES_PLUGIN, { projectInfo: this.localProjectSettings }).init();
  }

  /**
   * Dispatches the action to add the project to the list of projects
   */
  private dispatchProject(payload: ProjectSettings): void {
    store.dispatch({ type: REDUX_ACTIONS.addProjectToList, payload });
  }

}
