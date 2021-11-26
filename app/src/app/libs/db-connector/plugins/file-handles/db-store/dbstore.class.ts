import { AnitaUniversalDataStorage, RESERVED_AUDS_KEYS } from 'app/data/project-structure/project-info';
import { DataStructureExtender } from 'app/data/system-local-db/data-structure-extender.class';
import { DbConnectorInstance, DbStoreInterface, DsDbInitOptions } from 'app/libs/db-connector/models/executers';
import { fileHandleChecker } from 'app/libs/db-connector/plugins/file-handles/helpers/file-handle-checker.function';
import { readFileHandleAsText } from 'app/libs/db-connector/plugins/file-handles/helpers/fs-helper';
import { SaveProjectSettingsInIndexedDB } from 'app/libs/project-helpers/project-handlers/save-project-settings-in-indexeddb.class';

export class DbStore implements DbStoreInterface<AnitaUniversalDataStorage> {

  /**
   * Project data
   */
  public db: AnitaUniversalDataStorage = {
    [RESERVED_AUDS_KEYS._settings]: [],
    [RESERVED_AUDS_KEYS._sections]: []
  };

  /**
   * Contents of project file as string
   */
  private contents: string;

  constructor(
    private dbConnector: DbConnectorInstance<AnitaUniversalDataStorage>,
    private options: DsDbInitOptions
  ) { }

  public async initDB(): Promise<DbStoreInterface<AnitaUniversalDataStorage>> {

    if (!this.options.projectInfo)
      throw new Error('No projectInfo passed to DbConnector.\nTo retrieve a project from a local file, pass the an Object of type LocalProjectSettings as value of projectInfo to the options of DbConnector');

    const fileHandle = await fileHandleChecker(this.options);

    // If the project already had a FileHandle, the data file already existed so we read it and load it
    if (this.options.projectInfo.fileHandle)
      await this.initializeExistingProject();
    // Otherwise, we are inizializing a new project, so we store in memory the fileHandle, which will be saved by postProjectCreation when saving the project
    else
      this.options.projectInfo.fileHandle = fileHandle;

    return this;
  }

  public async postProjectCreation(): Promise<void> {
    await this.postProjectUpdate();
    await this.initializeExistingProject();
  }

  public async postProjectUpdate(): Promise<void> {
    await new SaveProjectSettingsInIndexedDB(this.dbConnector.dbStore.db[RESERVED_AUDS_KEYS._settings][0], { fileHandle: this.dbConnector.options.projectInfo.fileHandle }).save();
  }

  public close(): void {
    // NOT NEEDED
  }

  public async initializeExistingProject(): Promise<void> {
    await this.doReadFile();
    this.parseFileContents();
    this.makedDS();
  }

  /**
   * Loads file from disk using the fileHandle retrieved from IndexedDB
   */
  private async doReadFile(): Promise<void> {
    this.contents = await readFileHandleAsText(this.options.projectInfo.fileHandle);
  }

  /**
   * Parses the string file content as data
   */
  private parseFileContents(): void {
    this.db = JSON.parse(this.contents);
  }

  /**
   * Extends DS (DataStructure) with the sections of the project so that FormDataParserService correctly pares FormData
   *
   * @see FormDataParserService
   * @see DataStructureExtender
   */
  private makedDS(): void {
    this.dbConnector.DS = Object.assign(this.dbConnector.DS, new DataStructureExtender(this.db[RESERVED_AUDS_KEYS._sections]).extend());
  }

}
