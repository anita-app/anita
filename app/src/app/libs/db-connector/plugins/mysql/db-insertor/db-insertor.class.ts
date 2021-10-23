import { AbstractModel } from '@anita/client/libs/db-connector/constants/ds.constant';
import { Encrypter } from '@anita/client/libs/db-connector/crypter/encrypter.class';
import { DbConnectorInstance, Insertor } from '@anita/client/libs/db-connector/models/executers';
import { executeQuery } from '@anita/client/libs/db-connector/plugins/mysql/helpers/execute-query.function';
import { QueryMaker } from '@anita/client/libs/db-connector/plugins/mysql/helpers/query-maker.class';
import * as mysql from 'mysql';

/**
 * Implements insertor for MySql
 */
export class DbInsertor<E> implements Insertor<E> {

  /**
   * Creates an instance of db insertor.
   * @param section the section in which to insert the new element
   * @param element the element to insert
   */
  constructor(
    private dbConnector: DbConnectorInstance<mysql.Connection>,
    private section: keyof AbstractModel,
    private element: E
  ) { }

  /**
   * Builds the query with QueryMaker and runs it with executeQuery
   * 
   * @see QueryMaker
   * @see executeQuery
   */
  public async autoInsert(): Promise<void> {
    if (this.dbConnector.options.encrypted)
      await this.handleEncryption();
    const query: string = new QueryMaker(this.dbConnector, this.section, this.element).insert();
    await executeQuery(this.dbConnector, query);
  }

  /**
   * Handles encryption with Encrypter
   * 
   * @see Encrypter
   */
  private async handleEncryption(): Promise<void> {
    await new Encrypter(this.dbConnector, this.section, this.element).do();
  }

}
