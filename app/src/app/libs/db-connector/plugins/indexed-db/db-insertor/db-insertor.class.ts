import { AbstractModel } from '@anita/client/libs/db-connector/constants/ds.constant';
import { DbConnectorInstance, Insertor } from '@anita/client/libs/db-connector/models/executers';
import { QueryMaker } from '@anita/client/libs/db-connector/plugins/indexed-db/query-makers/query-maker.class';
import { Logger } from '@anita/client/libs/logger/logger.class';
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
    private element: E
  ) { }

  /**
   * Makes sure that all necessary fields are set and performs the insert
   */
  public autoInsert(): Promise<void> {
    return new QueryMaker(this.dbConnector, this.section, this.element)
      .insert()
      .catch(err => { Logger.error('Error in autoinsert: ', err); });
  }

}
