import { AdditionalInfoForLocalStorage, Section } from 'app/data/project-structure/project-info';
import { DataStructureExtender } from 'app/data/system-local-db/data-structure-extender.class';
import { auds_sections } from 'app/data/system-local-db/sections/auds-sections.const';
import { DbConnectorInstance, DbStoreInterface, DsDbInitOptions } from 'app/libs/db-connector/models/executers';
import { fileHandleChecker } from 'app/libs/db-connector/plugins/file-handles/helpers/file-handle-checker.function';
import { FileSystemFileHandle } from 'app/libs/db-connector/plugins/file-handles/helpers/file-system-access-api';
import { readFileAsUint8Array } from 'app/libs/db-connector/plugins/file-handles/helpers/fs-helper';
import { executeQueryWithReturn } from 'app/libs/db-connector/plugins/sqlite/helpers/execute-query-with-return.function';
import { SchemaCreator } from 'app/libs/db-connector/plugins/sqlite/helpers/schema-creator.class';
import { schemaExporter } from 'app/libs/db-connector/plugins/sqlite/helpers/schema-exporter.function';
import { serializer } from 'app/libs/db-connector/plugins/sqlite/helpers/serializer.function';
import { Database } from 'sql.js';
import initSqlJs from 'sql.js';

export class DbStore implements DbStoreInterface<Database> {

  /**
   * Project data
   */
  public db: Database;

  /**
   * Contents of project file as string
   */
  private contents: Uint8Array;

  constructor(
    private dbConnector: DbConnectorInstance<Database>,
    private options: DsDbInitOptions
  ) { }

  public async initDB(): Promise<DbStoreInterface<Database>> {

    if (!this.options.projectInfo)
      throw new Error('No projectInfo passed to DbConnector.\nTo retrieve a project from a local file, pass the an Object of type LocalProjectSettings as value of projectInfo to the options of DbConnector');

    const fileHandle = await fileHandleChecker(this.options, 'SQLite Project Database', { 'application/x-sqlite3': ['.db'] });

    // If the project already had a FileHandle, the data file already existed so we read it and load it
    if (this.options.projectInfo.fileHandle)
      await this.initializeExistingProject();
    // Otherwise, we are inizializing a new project, so we store in memory the fileHandle, which will be saved by postProjectCreation when saving the project
    else
      await this.onProjectCreation(fileHandle);

    return this;
  }

  public async postProjectCreation(): Promise<AdditionalInfoForLocalStorage> {
    return { fileHandle: this.dbConnector.options.projectInfo.fileHandle };
  }

  public async postProjectUpdate(): Promise<AdditionalInfoForLocalStorage> {
    return { fileHandle: this.dbConnector.options.projectInfo.fileHandle };
  }

  public close(): void {
    // NOT NEEDED
  }

  public async initializeExistingProject(): Promise<void> {
    await this.doReadFile();
    await this.loadDB(this.contents);
    const res = this.db.exec("SELECT * FROM _sections");
    console.log('openDatabase ~ res', res);
    this.makeDSFromDB();
  }

  private async onProjectCreation(fileHandle: FileSystemFileHandle): Promise<void> {
    Object.assign(this.options.projectInfo, { fileHandle });
    await this.loadDB();
    await new SchemaCreator(this, this.dbConnector.DS).createSchema();
    await schemaExporter(this.db, this.options.projectInfo.fileHandle);
  }

  /**
   * Loads file from disk using the fileHandle retrieved from IndexedDB
   */
  private async doReadFile(): Promise<void> {
    this.contents = await readFileAsUint8Array(this.options.projectInfo.fileHandle);
  }

  /**
   * Extends DS (DataStructure) with the sections of the project so that FormDataParserService correctly pares FormData
   *
   * @see FormDataParserService
   * @see DataStructureExtender
   */
  private async makeDSFromDB(): Promise<void> {
    const res = await executeQueryWithReturn(this.db, "SELECT * FROM _sections");
    const sections = serializer<Section>(res[0].columns, res[0].values);
    sections.forEach((section: any) => {
      auds_sections.jsonFields.forEach((field: string) => {
        section[field] = JSON.parse(section[field]);
      });
    });
    Object.assign(this.dbConnector.DS, new DataStructureExtender(sections).extend());
  }

  private async loadDB(contents?: Uint8Array): Promise<void> {
    const SQL = await initSqlJs({
      locateFile: () => '/assets/sql-wasm.wasm'
    });
    this.db = new SQL.Database(contents);
  }

}
