import { AnitaUniversalDataStorage } from '@anita/client/data/model/project-info';
import { AbstractModel } from '@anita/client/libs/db-connector/constants/ds.constant';
import { DbConnectorInstance, Deletor } from '@anita/client/libs/db-connector/models/executers';
import { executeQuery } from '@anita/client/libs/db-connector/plugins/mysql/helpers/execute-query.function';
import { QueryMaker } from '@anita/client/libs/db-connector/plugins/mysql/helpers/query-maker.class';

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
    private dbConnector: DbConnectorInstance<AnitaUniversalDataStorage>,
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

    return;
  }

}
