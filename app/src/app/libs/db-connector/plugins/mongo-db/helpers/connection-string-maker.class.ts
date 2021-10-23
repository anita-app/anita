import { MongoDbConnectionData } from '../../../models/executers';

/**
 * Makes the connection string to connect to a MongoDB instance.
 */
export class ConnectionStringMaker {

  /**
   * The connection string
   */
  private connectionString = 'mongodb://';

  /**
   * The connection details as specified by the user
   */
  constructor(
    private data: MongoDbConnectionData
  ) { }

  /**
   * Handles the logic to build the connection string
   */
  public make(): string {
    this.addFragment('username');
    this.addSeparator(':');
    this.addFragment('password');
    this.addSeparator('@');
    this.addUrl();
    this.addSeparator('/');
    this.addFragment('dbName');

    if (this.data.params)
      this.addParams();

    return this.connectionString;
  }

  /**
   * Adds a separator between the args of the connection string
   */
  private addSeparator(symbol: ':' | '@' | '/' | '?'): void {
    this.connectionString += symbol;
  }

  /**
   * Adds the values of the MongoDbConnectionData to the connection string
   */
  private addFragment(fragment: keyof MongoDbConnectionData): void {
    this.connectionString += this.data[fragment];
  }

  /**
   * Adds the url of the DB
   */
  private addUrl(): void {
    this.connectionString += this.data.url.join(',');
  }

  /**
   * Adds GET params
   */
  private addParams(): void {
    this.addSeparator('?');
    this.addFragment('params');
  }

}
