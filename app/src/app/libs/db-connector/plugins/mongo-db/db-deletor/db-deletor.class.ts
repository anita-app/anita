import { AbstractModel } from 'app/libs/db-connector/constants/ds.constant';
import { DbConnectorInstance, Deletor } from 'app/libs/db-connector/models/executers';
import { Logger } from 'app/libs/logger/logger.class';
import { Db } from 'mongodb';

/**
 * Implements deletor for MongoDB
 */
export class DbDeletor<E> implements Deletor<E> {

  /**
   * Creates an instance of db deletor.
   * @param section the section on which to perform the query
   * @param args the args to build the query
   */
  constructor(
    private dbConnector: DbConnectorInstance<Db>,
    private section: keyof AbstractModel,
    private args: Partial<E>
  ) { }

  /**
   * Checks the DB is connected, if not it esablishes a connection, and then calls autoDelete
   * 
   * @see autoDelete
   */
  public async autoDelete(): Promise<void> {
    if (this.dbConnector.dbStore['client'] && this.dbConnector.dbStore['client'].isConnected())
      return this.doAutoDelete();

    await this.dbConnector.dbStore.initDB();
    return this.autoDelete();
  }

  /**
   * Checks that at least one argument is present for the delete action. If so, it is processed with `deleteMany`
   */
  private async doAutoDelete(): Promise<void> {
    if (!this.args || !Object.keys(this.args).length)
      return this.throwFilterError();
    await this.dbConnector.dbStore.db.collection(this.dbConnector.DS[this.section].name).deleteMany(this.args);
  }

  /**
   * Throws an error if no arguments have been passed for the delete query
   */
  private throwFilterError(): void {
    Logger.error('Trying to call deleteMany with zero arguments, aborting autoDelete');
  }

  public async clearSection(): Promise<void> {
    // TODO
  }

}
