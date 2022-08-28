import { AdditionalInfoForLocalStorage, ISection } from 'app/data/project-structure/project-info'
import { DataStructureExtender } from 'app/data/system-local-db/data-structure-extender.class'
import { auds_sections } from 'app/data/system-local-db/sections/auds-sections.const'
import { AbstractModel } from 'app/libs/db-connector/models/abstract-model'
import { DbStoreInterface, DsDbInitOptions } from 'app/libs/db-connector/models/executers'
import { dirHandleChecker } from 'app/libs/db-connector/plugins/file-handles/helpers/file-handle-checker.function'
import { FileSystemDirectoryHandle } from 'app/libs/db-connector/plugins/file-handles/helpers/file-system-access-api'
import { FsHelper } from 'app/libs/db-connector/plugins/file-handles/helpers/fs-helper'
import { executeQueryWithReturn } from 'app/libs/db-connector/plugins/sqlite/helpers/execute-query-with-return.function'
import { SchemaCreator } from 'app/libs/db-connector/plugins/sqlite/helpers/schema-creator.class'
import { schemaExporter } from 'app/libs/db-connector/plugins/sqlite/helpers/schema-exporter.function'
import { serializer } from 'app/libs/db-connector/plugins/sqlite/helpers/serializer.function'
import initSqlJs, { Database } from 'sql.js'

/**
 * With sqlite we need to use the FileSystemDirectoryHandle to create the database file
 * Using the FileSystemFileHandle would result in the following error when updating the DB file after the first time:
 * "An operation that depends on state cached in an interface object was made but the state had changed since it was read from disk."
 */
export class DbStore implements DbStoreInterface<Database> {
  /**
   * Project data
   */
  public db: Database

  /**
   * Contents of project file as string
   */
  private contents: Uint8Array

  constructor (
    private options: DsDbInitOptions,
    private DS: AbstractModel
  ) { }

  public async initDB (): Promise<DbStoreInterface<Database>> {
    if (!this.options.projectInfo) {
      throw new Error('No projectInfo passed to DbConnector.\nTo retrieve a project from a local file, pass the an Object of type LocalProjectSettings as value of projectInfo to the options of DbConnector')
    }

    const fileHandle = await dirHandleChecker(this.options, 'SQLite Project Database', { 'application/x-sqlite3': ['.db'] })

    // If the project already had a FileHandle, the data file already existed so we read it and load it
    if (this.options.projectInfo.fileHandle) {
      await this.initializeExistingProject()
    }
    // Otherwise, we are inizializing a new project, so we store in memory the fileHandle, which will be saved by postProjectCreation when saving the project
    else {
      await this.onProjectCreation(fileHandle)
    }

    return this
  }

  public async postProjectCreation (): Promise<AdditionalInfoForLocalStorage> {
    await this.makeDSFromDB()
    return { fileHandle: this.options.projectInfo.fileHandle }
  }

  public async postProjectUpdate (): Promise<AdditionalInfoForLocalStorage> {
    return { fileHandle: this.options.projectInfo.fileHandle }
  }

  public close (): void {
    // NOT NEEDED
  }

  public async initializeExistingProject (): Promise<void> {
    await this.doReadFile()
    await this.loadDB(this.contents)
    await this.makeDSFromDB()
  }

  private async onProjectCreation (fileHandle: FileSystemDirectoryHandle): Promise<void> {
    Object.assign(this.options.projectInfo, { fileHandle })
    await this.loadDB()
    await new SchemaCreator(this, this.DS).createSchema()
    await schemaExporter(
      this.db,
      this.options.projectInfo.fileHandle as any as FileSystemDirectoryHandle,
      this.options.projectInfo.id
    )
  }

  /**
   * Loads file from disk using the fileHandle retrieved from IndexedDB
   */
  private async doReadFile (): Promise<void> {
    const fileName = `${this.options.projectInfo.id}.db`
    this.contents = await FsHelper.readDirFileAsUint8Array(this.options.projectInfo.fileHandle as any as FileSystemDirectoryHandle, fileName)
  }

  /**
   * Extends DS (DataStructure) with the sections of the project so that FormDataParserService correctly pares FormData
   *
   * @see FormDataParserService
   * @see DataStructureExtender
   */
  private async makeDSFromDB (): Promise<void> {
    const res = await executeQueryWithReturn(this.db, 'SELECT * FROM _sections')
    const sections = serializer<ISection>(res[0].columns, res[0].values)
    sections.forEach((section: any) => {
      auds_sections.jsonFields.forEach((field: string) => {
        section[field] = JSON.parse(section[field])
      })
    })
    Object.assign(this.DS, new DataStructureExtender(sections).extend())
  }

  private async loadDB (contents?: Uint8Array): Promise<void> {
    const SQL = await initSqlJs({
      locateFile: () => `${process.env.PUBLIC_URL}/assets/sql-wasm.wasm`
    })
    this.db = new SQL.Database(contents)
  }
}
