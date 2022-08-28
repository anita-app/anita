import { AbstractModel } from 'app/libs/db-connector/models/abstract-model';
import { DbConnectorInstance, Insertor } from 'app/libs/db-connector/models/executers';
import { QueryMaker } from 'app/libs/db-connector/plugins/indexed-db/query-makers/query-maker.class';
import { Logger } from 'app/libs/Logger/logger.class';
import Dexie from 'dexie';

/**
 * Implements insertor for IndexedDB
 */
export class DbInsertor<E> implements Insertor<E> {

  /**
   * Creates an instance of db insertor.
   * @param section the section in which to insert the new element
   * @param element the element to insert
   */
  constructor(
    private dbConnector: DbConnectorInstance<Dexie>,
    private section: keyof AbstractModel,
    private element: Array<E> | E
  ) { }

  /**
   * Makes sure that all necessary fields are set and performs the insert
   */
  public autoInsert(): Promise<void> {
    if (this.element instanceof Array) {
      return this.insertMany();
    } else {
      return this.insertOne();
    }
  }

  private insertMany(): Promise<void> {
    const table = this.dbConnector.DS[this.section].name;
    return this.dbConnector.dbStore.db[table].bulkPut(this.element);
  }


  private insertOne(): Promise<void> {
    return new QueryMaker(this.dbConnector, this.section, this.element)
      .insert()
      .catch(err => { Logger.error('Error in autoinsert: ', err); });
  }

}
