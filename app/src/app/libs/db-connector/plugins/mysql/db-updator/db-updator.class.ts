import { QueryMaker } from 'app/libs/db-connector/common-helpers/query-maker.class';
import { AbstractModel } from 'app/libs/db-connector/constants/ds.constant';
import { Encrypter } from 'app/libs/db-connector/crypter/encrypter.class';
import { DbConnectorInstance, Updator } from 'app/libs/db-connector/models/executers';
import { executeQuery } from 'app/libs/db-connector/plugins/mysql/helpers/execute-query.function';
import * as mysql from 'mysql';

/**
 * Implements updator for MySql
 */
export class DbUpdator<E> implements Updator<E> {

  /**
   * Creates an instance of db updator.
   * @param section the section of the element to update
   * @param element the element to update
   */
  constructor(
    private dbConnector: DbConnectorInstance<mysql.Connection>,
    private section: keyof AbstractModel,
    private element: Partial<E>
  ) { }

  /**
   * Handles JSON fields and encryption and then creates the query with QueryMaker and executes it with executeQuery
   * 
   * @see QueryMaker
   * @see executeQuery
   */
  public async autoUpdate(): Promise<void> {
    if (this.dbConnector.options.encrypted)
      await this.handleEncryption();
    const query: string = new QueryMaker(this.dbConnector, this.section, this.element).update();
    executeQuery(this.dbConnector, query);
  }

  /**
   * Handles encryption
   * 
   * @see Encrypter 
   */
  private async handleEncryption(): Promise<void> {
    await new Encrypter(this.dbConnector, this.section, this.element).do();
  }

}
