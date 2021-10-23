import {
  DbConnectionData,
  DbConnectorInstance,
  DbStoreInterface,
  DsDbInitOptions
  } from '@anita/client/libs/db-connector/models/executers';
import { Logger } from '@anita/client/libs/logger/logger.class';
import { Db, MongoClient } from 'mongodb';
import { ConnectionStringMaker } from '../helpers/connection-string-maker.class';

export class DbStore implements DbStoreInterface<Db> {

  public db: Db;

  private client: MongoClient;
  private connData: DbConnectionData = {
    connectionString: undefined,
    dbName: undefined
  };

  constructor(
    private dbConnector: DbConnectorInstance<Db>,
    private options: DsDbInitOptions = {}
  ) { }

  public async initDB(): Promise<DbStoreInterface<Db>> {
    if (!this.options.mongoDbConnectionData)
      throw new Error('No mongoDbConnectionData passed to DbConnector.\nTo initialize a MongoDB connection, pass the an Object of type MongoDbConnectionData as value of mongoDbConnectionData to the options');

    this.setDbInstance();

    await new Promise(resolve => this.doConnect(resolve));

    return this;
  }

  public close(): void {
    this.client.close();
  }

  private setDbInstance(): void {
    this.connData.connectionString = new ConnectionStringMaker(this.options.mongoDbConnectionData).make();
    this.connData.dbName = this.options.mongoDbConnectionData.dbName;
  }

  private doConnect(resolve: (value?: unknown) => void): void {
    MongoClient.connect(this.connData.connectionString, { useNewUrlParser: true }, (err, db: MongoClient) => {

      if (err) throw err;

      this.db = db.db(this.connData.dbName);
      this.client = db;

      Logger.info('MongoDB connected');
      resolve();
    });
  }

}
