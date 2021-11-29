import { RESERVED_FIELDS } from 'app/data/project-structure/reserved-fields.constant';
import { AbstractModel } from 'app/libs/db-connector/constants/ds.constant';
import { Encrypter } from 'app/libs/db-connector/crypter/encrypter.class';
import { DbConnectorInstance, Updator } from 'app/libs/db-connector/models/executers';
import { Db } from 'mongodb';

/**
 * Implements updator for MongoDB
 */
export class DbUpdator<E> implements Updator<E> {

  /**
   * Object with `key` the pk of the section, and `value` the pk value of the element to update
   */
  private filter: Partial<E> = {};
  /**
   * Query to run with MongoDB
   */
  private query: { [key: string]: any } = {};

  /**
   * Creates an instance of db updator.
   * @param section the section of the element to update
   * @param element the element to update 
   */
  constructor(
    private dbConnector: DbConnectorInstance<Db>,
    private section: keyof AbstractModel,
    private element: Partial<E>
  ) { }

  /**
   * Checks the DB is connected, if not it esablishes a connection, and then calls prepareUpdate
   * 
   * @see prepareUpdate
   */
  public async autoUpdate(): Promise<void> {
    if (this.dbConnector.dbStore['client'] && this.dbConnector.dbStore['client'].isConnected())
      return this.prepareUpdate();

    await this.dbConnector.dbStore.initDB();

    return this.autoUpdate();
  }

  /**
   * Prepares the filter and the query, a then calls doAutoUpdate
   * 
   * @see doAutoUpdate
   */
  private async prepareUpdate(): Promise<void> {
    this.setFilter();
    if (!Object.keys(this.filter).length)
      return this.throwFilterError();
    if (this.dbConnector.options.encrypted)
      await this.handleEncryption();

    this.setQuery();
    await this.doAutoUpdate();
  }

  /**
   * Prepares the key value pair with the pk value of the element to identify it in the DB
   */
  private setFilter(): void {
    this.filter[this.dbConnector.DS[this.section].pk] = this.element[this.dbConnector.DS[this.section].pk];
  }

  /**
   * Sets the query to update the element
   */
  private setQuery(): void {
    this.query = {
      $set: this.element
    };
    if (this.dbConnector.DS[this.section].fields.includes(RESERVED_FIELDS.updatedAt))
      this.query.$currentDate = { updatedAt: true };
  }

  /**
   * Handles encryption
   * 
   * @see Encrypter
   */
  private async handleEncryption(): Promise<void> {
    await new Encrypter(this.dbConnector, this.section, this.element).do();
  }

  /**
   * Runs the actual update
   */
  private async doAutoUpdate(): Promise<void> {
    await this.dbConnector.dbStore.db.collection(this.dbConnector.DS[this.section].name).updateOne(this.filter, this.query);
  }

  /**
   * Throws an error if the pk value of the element was not provided
   */
  private throwFilterError(): void {
    console.error('PK of element to update not set, aborting autoUpdate');
  }

}
