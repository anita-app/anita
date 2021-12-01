import { QueryMaker } from 'app/libs/db-connector/common-helpers/query-maker.class';
import { WhereBuilder } from 'app/libs/db-connector/common-helpers/where-builder.class';
import { AbstractModel } from 'app/libs/db-connector/models/abstract-model';
import { DbConnectorInstance, Deletor } from 'app/libs/db-connector/models/executers';
import { FileSystemDirectoryHandle } from 'app/libs/db-connector/plugins/file-handles/helpers/file-system-access-api';
import { executeQueryNoReturn } from 'app/libs/db-connector/plugins/sqlite/helpers/execute-query-no-return.function';
import { schemaExporter } from 'app/libs/db-connector/plugins/sqlite/helpers/schema-exporter.function';
import { Database } from 'sql.js';

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
    private dbConnector: DbConnectorInstance<Database>,
    private section: keyof AbstractModel,
    args: Partial<E>
  ) {
    super(args);
  }

  /**
   * Deletes an element from the collection
   */
  public async autoDelete(): Promise<any> {

    if (!Object.keys(this.args).length)
      return 'Fatal error: trying to delete without any parameter';

    const query: string = new QueryMaker(this.dbConnector, this.section).delete(this.whereArgs);
    await executeQueryNoReturn(this.dbConnector, query);

    await schemaExporter(this.dbConnector.dbStore.db, this.dbConnector.options.projectInfo.fileHandle as any as FileSystemDirectoryHandle);

  }

  public async clearSection(): Promise<void> {
    // TODO
  }

}
