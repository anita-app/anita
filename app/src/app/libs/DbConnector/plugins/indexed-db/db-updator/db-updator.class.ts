import { AbstractModel } from 'app/libs/DbConnector/models/abstract-model'
import { DbConnectorInstance, Updator } from 'app/libs/DbConnector/models/executers'
import { QueryMaker } from 'app/libs/DbConnector/plugins/indexed-db/query-makers/query-maker.class'
import { Logger } from 'app/libs/Logger/logger.class'
import Dexie from 'dexie'

/**
 * Implements updator for IndexedDb
 */
export class DbUpdator<E> implements Updator<E> {
  /**
   * Creates an instance of db updator.
   * @param section the section of the element to update
   * @param element the full element updated
   */
  constructor (
    private dbConnector: DbConnectorInstance<Dexie>,
    private section: keyof AbstractModel,
    private element: Partial<E>
  ) { }

  /**
   * Calls `QueryMaker` and updates the element
   */
  public autoUpdate (): Promise<void> {
    return new QueryMaker(this.dbConnector, this.section, this.element)
      .update()
      .catch(err => {
        Logger.error('Error in autoUpdate', err)
      })
  }
}
