import { AdditionalInfoForLocalStorage, RESERVED_AUDS_KEYS, SystemData } from 'app/data/project-structure/project-info'
import { DataStructureExtender } from 'app/data/system-local-db/data-structure-extender.class'
import { AbstractModel } from 'app/libs/db-connector/models/abstract-model'
import { DbStoreInterface, DsDbInitOptions } from 'app/libs/db-connector/models/executers'
import Dexie, { Version } from 'dexie'

/**
 * Implementation of DbStore for IndexedDB with Dexie.
 */
export class DbStore implements DbStoreInterface<Dexie> {
  public db!: Dexie
  private deletedSections: Array<string> = []

  constructor (
    private options: DsDbInitOptions,
    private DS: AbstractModel
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

  public async postProjectUpdate (project: SystemData): Promise<AdditionalInfoForLocalStorage> {
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
    })
    )
  }

  private buildDb (): Version {
    const version = this.options.previousVersions?.length ? this.options.previousVersions.length + 1 : 1
    const tables: { [key: string]: string | null} = {}

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
