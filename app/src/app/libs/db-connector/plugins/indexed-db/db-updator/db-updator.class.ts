import { AbstractModel } from '@anita/client/libs/db-connector/constants/ds.constant';
import { DbConnectorInstance, Updator } from '@anita/client/libs/db-connector/models/executers';
import { QueryMaker } from '@anita/client/libs/db-connector/plugins/indexed-db/query-makers/query-maker.class';
import { Logger } from '@anita/client/libs/logger/logger.class';
import Dexie from 'dexie';

/**
 * Implements updator for IndexedDb
 */
export class DbUpdator<E> implements Updator<E> {

  /**
   * Creates an instance of db updator.
   * @param section the section of the element to update
   * @param element the full element updated
   */
  constructor(
    private dbConnector: DbConnectorInstance<Dexie>,
    private section: keyof AbstractModel,
    private element: Partial<E>
  ) { }

  /**
   * Calls `QueryMaker` and updates the element
   */
  public autoUpdate(): Promise<void> {
    return new QueryMaker(this.dbConnector, this.section, this.element)
      .update()
      .catch(err => { Logger.error('Error in autoUpdate', err); });
  }

}
