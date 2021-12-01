import { AbstractModel } from 'app/libs/db-connector/models/abstract-model';
import { DbConnectorInstance, Deletor } from 'app/libs/db-connector/models/executers';
import { Database } from 'sql.js';

/**
 * Implements deletor for MySql
 */
export class DbDeletor<E> implements Deletor<E> {

  /**
   * Creates an instance of db deletor.
   * @param section the section on which to perform the query
   * @param args the args of the query
   */
  constructor(
    private dbConnector: DbConnectorInstance<Database>,
    private section: keyof AbstractModel,
    private args: Partial<E>
  ) { }

  /**
   * Deletes an element from the collection
   */
  public async autoDelete(): Promise<any> {

    if (!Object.keys(this.args).length)
      return 'Fatal error: trying to delete without any parameter';

    // TODO
  }

  public async clearSection(): Promise<void> {
    // TODO
  }

}
