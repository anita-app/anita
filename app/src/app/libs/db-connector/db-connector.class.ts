import { AUDS_SYSTEM_SECTIONS_DEFINITIONS } from 'app/data/system-local-db/auds-system-sections.enum';
import { AbstractModel } from 'app/libs/db-connector/constants/ds.constant';
import { DataStructureBuilder } from 'app/libs/db-connector/db-builder/data-structure-builder.class';
import { SectionDefinition } from 'app/libs/db-connector/db-builder/sez-definition';
import {
  DbConnectorInstance,
  DbObjects,
  DbStoreInterface,
  Deletor,
  DsDbInitOptions,
  Insertor,
  Selector,
  Updator
  } from 'app/libs/db-connector/models/executers';

/**
 *  Initialize `db-connector` for the given storage (MySQL, IndexedDB, etc.)
 *
 * @param executers The plugin implementing the read/write operations on the DB
 * @param [options={}] Initialization options of the DB. These very depending on the plugin requirements (e.g. connection parameters)
 * @param [allSez] section definitions defining the data structure of the DB
 * @param [addSystemSections=true] whether to automatically build the data structure for system sections (`_settings` and `_sections`)
 */
export class DbConnector<DbTypes> implements DbConnectorInstance<DbTypes> {

  public dbStore: DbStoreInterface<DbTypes>;
  public DS: AbstractModel = {};

  constructor(
    private executers: DbObjects<unknown, DbTypes>,
    public options: DsDbInitOptions = {},
    private allSez: Array<SectionDefinition<any>> = [],
    private addSystemSections: boolean = true
  ) { }

  public async init(): Promise<DbConnectorInstance<DbTypes>> {

    if (this.addSystemSections)
      this.DS = Object.assign(this.DS, new DataStructureBuilder(AUDS_SYSTEM_SECTIONS_DEFINITIONS).make());

    if (this.allSez.length)
      this.DS = Object.assign(this.DS, new DataStructureBuilder(this.allSez).make());

    if (this.executers.dbStore)
      this.dbStore = await new this.executers.dbStore(this, this.options).initDB();
    else
      throw new Error('No dbStore passed to DbConnector. To initialize DbConnector, you must pass a valid dbStore');

    return this;
  }

  /**
   * Ready to call function that returns an instance of the insertor of the plugin passed to DbInit.
   * @param section the section on which to perform the query.
   * @param element the alement to insert in the DB.
   * @returns an instance of insertor (don't forget to call `autoInsert`)
   */
  public callInsertor<E>(section: keyof AbstractModel, element: E): Insertor<E> {
    return new this.executers.insertor(this, section, element);
  }

  /**
   * Ready to call function that returns an instance of the selector of the plugin passed to DbInit.
   * @param section the section on which to perform the query.
   * @param args the arguments to build the query.
   * @returns an instance of selector (don't forget to call `single` or `multiple` or `count`)
   */
  public callSelector<E>(section: keyof AbstractModel, args?: Partial<E>): Selector<E> {
    return new this.executers.selector(this, section, args) as Selector<E>;
  }

  /**
   * Ready to call function that returns an instance of the updator of the plugin passed to DbInit.
   * @param section the section on which to perform the query.
   * @param args the element to update in the DB.
   * @returns an instance of updator (don't forget to call `autoUpdate`)
   */
  public callUpdator<E>(section: keyof AbstractModel, element: Partial<E>): Updator<E> {
    return new this.executers.updator(this, section, element);
  }

  /**
   * Ready to call function that returns an instance of the deletor of the plugin passed to DbInit.
   * @param section the section on which to perform the query.
   * @param args the arguments to build the query.
   * @returns an instance of deletor (don't forget to call `autoDelete`)
   */
  public callDeletor<E>(section: keyof AbstractModel, args: Partial<E>): Deletor<E> {
    return new this.executers.deletor(this, section, args);
  }

}
