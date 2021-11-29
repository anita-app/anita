import { AdditionalInfoForLocalStorage, RESERVED_AUDS_KEYS, SystemData } from 'app/data/project-structure/project-info';
import { DataStructureExtender } from 'app/data/system-local-db/data-structure-extender.class';
import { DbConnectorInstance, DbStoreInterface, DsDbInitOptions } from 'app/libs/db-connector/models/executers';
import Dexie from 'dexie';

/**
 * Implementation of DbStore for IndexedDB with Dexie.
 */
export class DbStore implements DbStoreInterface<Dexie> {

  public db: Dexie;
  private deletedSections: Array<string> = [];

  constructor(
    private dbConnector: DbConnectorInstance<Dexie>,
    private options: DsDbInitOptions
  ) { }

  public async initDB(): Promise<DbStoreInterface<Dexie>> {

    if (!this.dbConnector.options.indexedDbName)
      throw Error('No name found in DsDbInitOptions. Please provide a name for the database by setting the name on the property indexedDbName in the options passed to DbConnector.');

    this.setDb();

    if (!this.options.previousVersions)
      this.options.previousVersions = [];

    this.handlePreviousVersion();

    this.buildDb();

    return this;
  }

  public async postProjectCreation(): Promise<AdditionalInfoForLocalStorage> {
    return this.makeDexieInfoForUpgrade();
  }

  public async postProjectUpdate(project: SystemData): Promise<AdditionalInfoForLocalStorage> {
    const newSections = Object.keys(project[RESERVED_AUDS_KEYS._sections]);
    const oldSections = Object.keys(this.dbConnector.DS);

    // Check if any section in oldSections has been deleted, or if any section in newSections has been added
    const sectionsToDelete = oldSections.filter(section => !newSections.includes(section));
    const sectionsToAdd = newSections.filter(section => !oldSections.includes(section));

    // If there are sections to delete or to add, we push a new array to previousVersions
    // We don't need to store the new sections as Dexie from v.3.0.0 on, will automatically create the new tables
    if (sectionsToDelete.length > 0 || sectionsToAdd.length > 0) {
      this.options.previousVersions.push(sectionsToDelete.concat());
      this.dbConnector.DS = new DataStructureExtender(project[RESERVED_AUDS_KEYS._sections]).extend();

      // We need to rebuild the database, see https://dexie.org/docs/Dexie/Dexie.close()
      this.close();
      this.handlePreviousVersion();
      this.buildDb();
    }

    return this.makeDexieInfoForUpgrade();
  }

  public close(): void {
    this.db.close()
  }

  public onProjectDeleted(): Promise<void> {
    return this.dbConnector.dbStore.db.delete();
  }

  private makeDexieInfoForUpgrade(): AdditionalInfoForLocalStorage {
    return { dexieInfoForUpgrade: { previousVersions: this.options.previousVersions, DS: this.dbConnector.DS } };
  }


  private setDb(): void {
    this.db = new Dexie(this.dbConnector.options.indexedDbName);
  }

  // Adds to deletedSections the sections that are not in the DS anymore
  // In buildDb we will delete the sections that are not in the DS anymore
  private handlePreviousVersion(): void {
    this.deletedSections = [];
    this.options.previousVersions.forEach(versionSezs =>
      versionSezs.forEach(section => {
        if (!this.dbConnector.DS[section])
          this.deletedSections.push(section);
      })
    );
  }

  private buildDb(): void {
    const version = this.options.previousVersions?.length + 1 || 1;
    const tables = {};

    for (const section in this.dbConnector.DS)
      tables[this.dbConnector.DS[section].name] = this.dbConnector.DS[section].indexes.join();

    // Removes the sections that are not in the DS anymore
    // See https://dexie.org/docs/Tutorial/Understanding-the-basics#deleting-tables
    this.deletedSections.forEach(section => tables[section] = null);

    this.db.version(version).stores(tables);
  }

}
