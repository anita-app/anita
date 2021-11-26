import { AbstractModel } from 'app/libs/db-connector/constants/ds.constant';
import { DataStructureBuilder } from 'app/libs/db-connector/db-builder/data-structure-builder.class';
import { SectionDefinition } from 'app/libs/db-connector/db-builder/sez-definition';
import { DbConnectorInstance, DbStoreInterface, DsDbInitOptions } from 'app/libs/db-connector/models/executers';
import Dexie from 'dexie';

/**
 * Implementation of DbStore for IndexedDB with Dexie.
 */
export class DbStore implements DbStoreInterface<Dexie> {

  public db: Dexie;
  private lastPreviousVersionScheme = undefined;

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

    const currentVersion = (this.options.previousVersions.length) ? this.options.previousVersions.length + 1 : 1;

    if (this.options.previousVersions.length)
      this.options.previousVersions.forEach((versionSezs, index) => this.handlePreviousVersion(versionSezs, index + 1));

    this.buildVersionDb(this.dbConnector.DS, currentVersion);

    return this;
  }

  public async postProjectCreation(): Promise<void> {
    // TODO Save in system indexedDB the project info with the DS
  }

  public async postProjectUpdate(): Promise<void> {
    // TODO Update if needed the DS in the system indexedDB with previous versions
  }

  public close(): void {
    // not needed in IndexedDB
  }

  private setDb(): void {
    this.db = new Dexie(this.dbConnector.options.indexedDbName);
  }

  private handlePreviousVersion(versionSezs: Array<SectionDefinition<any>>, version: number): void {
    const versionDS = new DataStructureBuilder(versionSezs).make();
    this.buildVersionDb(versionDS, version);
    this.lastPreviousVersionScheme = versionDS;
  }

  private buildVersionDb(versionDS: AbstractModel, version: number): void {
    const tables = {};

    for (const section in versionDS)
      if (!this.lastPreviousVersionScheme || !this.lastPreviousVersionScheme[section])
        tables[versionDS[section].name] = versionDS[section].indexes.join();

    this.db.version(version).stores(tables);
  }

}
