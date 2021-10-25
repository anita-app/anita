import { AbstractModel } from '@anita/client/libs/db-connector/constants/ds.constant';
import { DbConnectorInstance, Deletor } from '@anita/client/libs/db-connector/models/executers';
import { executeQuery } from '@anita/client/libs/db-connector/plugins/mysql/helpers/execute-query.function';
import { QueryMaker } from '@anita/client/libs/db-connector/plugins/mysql/helpers/query-maker.class';
import { WhereBuilder } from '@anita/client/libs/db-connector/plugins/mysql/helpers/where-builder.class';
import * as mysql from 'mysql';

/**
 * Implements deletor for MySql
 */
export class DbDeletor<E> extends WhereBuilder<E> implements Deletor<E> {

  /**
   * Creates an instance of db deletor.
   * @param section the section on which to perform the query
   * @param args the args of the query
   */
  constructor(
    private dbConnector: DbConnectorInstance<mysql.Connection>,
    private section: keyof AbstractModel,
    args: Partial<E>
  ) {
    super(args);
  }

  /**
   * Builds the query with QueryMaker and runs it with executeQuery
   * 
   * @see QueryMaker
   * @see executeQuery
   */
  public async autoDelete(): Promise<any> {

    if (!this.whereArgs.length)
      return 'Fatal error: trying to delete without any parameter';

    const query: string = new QueryMaker(this.dbConnector, this.section).delete(this.whereArgs);
    const res = await executeQuery(this.dbConnector, query);
    return res;
  }

}
