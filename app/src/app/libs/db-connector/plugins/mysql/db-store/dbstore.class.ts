import { AbstractModel } from 'app/libs/db-connector/models/abstract-model'
import { DbStoreInterface, DsDbInitOptions } from 'app/libs/db-connector/models/executers'
import { Logger } from 'app/libs/Logger/logger.class'
import * as mysql from 'mysql'

export class DbStore implements DbStoreInterface<mysql.Connection> {
  public db: mysql.Connection

  constructor (
    private options: DsDbInitOptions,
    private DS: AbstractModel
  ) { }

  public async initDB (): Promise<DbStoreInterface<mysql.Connection>> {
    if (!this.options.mySqlConnectionConfig) {
      throw new Error('No mySqlConnectionConfig passed to DbConnector.\nTo initialize a MySQL connection, pass an Object of type ConnectionConfig as value of mySqlConnectionConfig to the options')
    }

    this.db = mysql.createConnection(this.options.mySqlConnectionConfig)

    await new Promise((resolve, reject) => this.doConnect(resolve, reject))

    return this
  }

  public close (): void {
    this.db.end((err: mysql.MysqlError) => {
      // The connection is terminated gracefully
      // Ensures all previously enqueued queries are still
      // before sending a COM_QUIT packet to the MySQL server.
      Logger.error(err?.message)
    })
  }

  public doConnect (resolve: (value?: unknown) => void, reject: (err: mysql.MysqlError) => void): void {
    this.db.connect((err: mysql.MysqlError) => {
      if (err) reject(err)
      resolve()
    })
  }
}
