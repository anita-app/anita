import { AbstractModel } from 'app/libs/DbConnector/models/abstract-model'
import { DbConnectorInstance, Deletor } from 'app/libs/DbConnector/models/executers'
import { QueryMaker } from 'app/libs/DbConnector/plugins/indexed-db/query-makers/query-maker.class'
import { Logger } from 'app/libs/Logger/logger.class'
import Dexie from 'dexie'

/**
 * Implements the deletor for IndexedDB
 */
export class DbDeletor<E> implements Deletor<E> {
  /**
   * Creates an instance of db deletor.
   * @param section the section of the element to delete
   * @param args the arguments for the query, must include the primary key (`pk`) value
   */
  constructor (
    private dbConnector: DbConnectorInstance<Dexie>,
    private section: keyof AbstractModel,
    private args: Partial<E>
  ) { }

  /**
   * Perform the delete action on the given element.
   */
  public async autoDelete (): Promise<void> {
    if (this.args[this.dbConnector.DS[this.section].pk]) {
      const aliasElementToDelete = this.args[this.dbConnector.DS[this.section].pk]
      await new QueryMaker(this.dbConnector, this.section)
        .addWhere([this.dbConnector.DS[this.section].pk as string, '=', aliasElementToDelete])
        .delete()
    } else {
      Logger.error('Error in autoDelete', 'No PK value was found on the element')
    }
  }

  public async clearSection (): Promise<void> {
    await new QueryMaker(this.dbConnector, this.section)
      .clearTable()
  }
}
