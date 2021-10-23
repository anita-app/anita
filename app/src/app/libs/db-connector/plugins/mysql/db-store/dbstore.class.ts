import { DbConnectorInstance, DbStoreInterface, DsDbInitOptions } from '@anita/client/libs/db-connector/models/executers';
import * as mysql from 'mysql';

export class DbStore implements DbStoreInterface<mysql.Connection> {
  public db: mysql.Connection;

  constructor(
    private dbConnector: DbConnectorInstance<mysql.Connection>,
    private options: DsDbInitOptions
  ) { }

  public async initDB(): Promise<DbStoreInterface<mysql.Connection>> {

    if (!this.options.mySqlConnectionConfig)
      throw new Error('No mySqlConnectionConfig passed to DbConnector.\nTo initialize a MySQL connection, pass the an Object of type ConnectionConfig as value of mySqlConnectionConfig to the options');

    this.db = mysql.createConnection(this.options.mySqlConnectionConfig);

    await new Promise((resolve, reject) => this.doConnect(resolve, reject));

    return this;
  }

  public close(): void {
    this.db.end((err: mysql.MysqlError) => {
      // The connection is terminated gracefully
      // Ensures all previously enqueued queries are still
      // before sending a COM_QUIT packet to the MySQL server.
    });
  }

  public doConnect(resolve: (value?: unknown) => void, reject: (err: mysql.MysqlError) => void): void {
    this.db.connect((err: mysql.MysqlError) => {
      if (err) reject(err);
      resolve();
    });
  }

}
