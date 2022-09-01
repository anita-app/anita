import { AdditionalInfoForLocalStorage, AnitaUniversalDataStorage, RESERVED_AUDS_KEYS } from 'app/data/project-structure/project-info'
import { DataStructureExtender } from 'app/data/system-local-db/data-structure-extender.class'
import { AbstractModel } from 'app/libs/DbConnector/models/abstract-model'
import { DbStoreInterface, DsDbInitOptions } from 'app/libs/DbConnector/models/executers'
import { fileHandleChecker } from 'app/libs/DbConnector/plugins/file-handles/helpers/file-handle-checker.function'
import { FsHelper } from 'app/libs/DbConnector/plugins/file-handles/helpers/fs-helper'

export class DbStore implements DbStoreInterface<AnitaUniversalDataStorage> {
  /**
   * Project data
   */
  public db: AnitaUniversalDataStorage = {
    [RESERVED_AUDS_KEYS._settings]: [],
    [RESERVED_AUDS_KEYS._sections]: []
  }

  /**
   * Contents of project file as string
   */
  private contents: string

  constructor (
    private options: DsDbInitOptions,
    private DS: AbstractModel
  ) { }

  public async initDB (): Promise<DbStoreInterface<AnitaUniversalDataStorage>> {
    if (!this.options.projectInfo) {
      throw new Error('No projectInfo passed to DbConnector.\nTo retrieve a project from a local file, pass the an Object of type LocalProjectSettings as value of projectInfo to the options of DbConnector')
    }

    const fileHandle = await fileHandleChecker(this.options)

    // If the project already had a FileHandle, the data file already existed so we read it and load it
    if (this.options.projectInfo.fileHandle) {
      await this.initializeExistingProject()
    } else {
      // Otherwise, we are inizializing a new project, so we store in memory the fileHandle, which will be saved by postProjectCreation when saving the project
      this.options.projectInfo.fileHandle = fileHandle
    }

    return this
  }

  public async postProjectCreation (): Promise<AdditionalInfoForLocalStorage> {
    await this.initializeExistingProject()
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
    this.parseFileContents()
    this.makedDS()
  }

  /**
   * Loads file from disk using the fileHandle retrieved from IndexedDB
   */
  private async doReadFile (): Promise<void> {
    this.contents = await FsHelper.readFileHandleAsText(this.options.projectInfo.fileHandle)
  }

  /**
   * Parses the string file content as data
   */
  private parseFileContents (): void {
    this.db = JSON.parse(this.contents)
  }

  /**
   * Extends DS (DataStructure) with the sections of the project so that FormDataParserService correctly pares FormData
   *
   * @see FormDataParserService
   * @see DataStructureExtender
   */
  private makedDS (): void {
    Object.assign(this.DS, new DataStructureExtender(this.db[RESERVED_AUDS_KEYS._sections]).extend())
  }
}
