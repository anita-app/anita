import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { DataStructureExtender } from 'app/data/system-local-db/data-structure-extender.class'
import Dexie from 'dexie'
import type { AdditionalInfoForLocalStorage, TSystemData } from 'app/models/project/project.declarations'
import type { AbstractModel } from 'app/libs/db-connector/models/abstract-model'
import type { DbStoreInterface, DsDbInitOptions } from 'app/libs/db-connector/models/executers'
import type { Version } from 'dexie'

/**
 * Implementation of DbStore for IndexedDB with Dexie.
 * @feature storage.local-database
 * @title Where your data is kept
 * @summary Projects and records are saved in the browser of your device, without any Anita server.
 * @where Automatic; nothing to set. The data lives in the storage of the browser (IndexedDB) for the site of Anita.
 * @usage Nothing to do: every change is saved on the device as soon as you make it.
 * @options none
 * @rules Anita has no server: your data never leaves the device unless you sync it with Dropbox or WordPress, or export it.
 * The data belongs to one browser on one device: another browser, another device or a private window does not see it. To use the same projects elsewhere, sync or export them.
 * The list of projects is kept in one database of the browser; each project has its own database with a table per section.
 * Removing a section from a project deletes its records from the device; deleting a project deletes its database from the device.
 * Clearing the site data or the history of the browser (or private windows being closed) deletes the data kept on the device: keep a copy with sync or export.
 * @errors none
 * @status stable
 * @since 0.9.0
 * @related app.offline
 */
export class DbStore implements DbStoreInterface<Dexie> {
  public db!: Dexie
  private deletedSections: Array<string> = []

  constructor (
    private options: DsDbInitOptions,
    private DS: AbstractModel,
  ) { }

  public async initDB (): Promise<DbStoreInterface<Dexie>> {
    if (!this.options.indexedDbName) {
      throw Error('No name found in DsDbInitOptions. Please provide a name for the database by setting the name on the property indexedDbName in the options passed to DbConnector.')
    }

    this.setDb()

    if (!this.options.previousVersions) {
      this.options.previousVersions = []
    }

    this.handlePreviousVersion()

    this.buildDb()

    return this
  }

  public async postProjectCreation (): Promise<AdditionalInfoForLocalStorage> {
    return this.makeDexieInfoForUpgrade()
  }

  public async postProjectUpdate (project: TSystemData): Promise<AdditionalInfoForLocalStorage> {
    const newSections = Object.keys(project).concat(project[RESERVED_AUDS_KEYS._sections].map(section => section.id))
    const oldSections = Object.keys(this.DS)

    // Check if any section in oldSections has been deleted, or if any section in newSections has been added
    const sectionsToDelete = oldSections.filter(section => !newSections.includes(section))
    const sectionsToAdd = newSections.filter(section => !oldSections.includes(section))

    // If there are sections to delete or to add, we push a new array to previousVersions
    // We don't need to store the new sections as Dexie from v.3.0.0 on, will automatically create the new tables
    if (sectionsToDelete.length > 0 || sectionsToAdd.length > 0) {
      this.options.previousVersions!.push(sectionsToDelete.concat())

      // We need to delete the sections that are not in the DS anymore
      sectionsToDelete.forEach(section => {
        delete this.DS[section]
      })

      // We need to add the sections that have been added to the DS
      if (sectionsToAdd.length > 0) {
        const newSections = project[RESERVED_AUDS_KEYS._sections].filter(section => sectionsToAdd.includes(section.id))
        Object.assign(this.DS, new DataStructureExtender(newSections).extend())
      }

      // We need to rebuild the database, see https://dexie.org/docs/Dexie/Dexie.close()
      this.close()
      this.handlePreviousVersion()
      this.buildDb()
      await this.db.open()
    }

    return this.makeDexieInfoForUpgrade()
  }

  public close (): void {
    return this.db.close()
  }

  public onProjectDeleted (): Promise<void> {
    return this.db.delete()
  }

  private makeDexieInfoForUpgrade (): AdditionalInfoForLocalStorage {
    return { dexieInfoForUpgrade: { previousVersions: this.options.previousVersions!, DS: this.DS } }
  }

  private setDb (): void {
    this.db = new Dexie(this.options.indexedDbName!)
  }

  // Adds to deletedSections the sections that are not in the DS anymore
  // In buildDb we will delete the sections that are not in the DS anymore
  private handlePreviousVersion (): void {
    this.deletedSections = []
    this.options.previousVersions?.forEach(versionSezs => versionSezs.forEach(section => {
      if (!this.DS[section]) {
        this.deletedSections.push(section)
      }
    }),
    )
  }

  private buildDb (): Version {
    const version = this.options.previousVersions?.length ? this.options.previousVersions.length + 1 : 1
    const tables: { [key: string]: string | null } = {}

    for (const section in this.DS) {
      tables[this.DS[section].name] = this.DS[section].indexes.join()
    }

    // Removes the sections that are not in the DS anymore
    // See https://dexie.org/docs/Tutorial/Understanding-the-basics#deleting-tables
    this.deletedSections.forEach(section => {
      tables[section] = null
    })

    return this.db.version(version).stores(tables)
  }
}
