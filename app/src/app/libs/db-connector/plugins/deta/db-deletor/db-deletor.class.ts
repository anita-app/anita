import { AbstractModel } from 'app/libs/db-connector/models/abstract-model'
import { DbConnectorInstance, Deletor } from 'app/libs/db-connector/models/executers'
import { Logger } from 'app/libs/logger/logger.class'
import Base from 'deta/dist/types/base'

/**
 * Implements the deletor for Deta Base
 * @see https://docs.deta.sh/docs/base/sdk
 */
export class DbDeletor<E> implements Deletor<E> {
  /**
   * Creates an instance of db deletor.
   * @param section the section of the element to delete
   * @param args the arguments for the query, must include the primary key (`pk`) value
   */
  constructor (
    private dbConnector: DbConnectorInstance<Base>,
    private section: keyof AbstractModel,
    private args: Partial<E>
  ) { }

  /**
   * Perform the delete action on the given element.
   */
  public async autoDelete (): Promise<void> {
    if (this.args[this.dbConnector.DS[this.section].pk]) {
      const key = this.args[this.dbConnector.DS[this.section].pk]
      await this.dbConnector.dbStore.db.delete(key)
    } else {
      Logger.error('Error in autoDelete', 'No PK value was found on the element')
    }
  }

  public async clearSection (): Promise<void> {
    // not implemented
  }
}
