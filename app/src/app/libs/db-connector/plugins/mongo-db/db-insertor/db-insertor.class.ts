import { AbstractModel } from 'app/libs/db-connector/constants/ds.constant';
import { Encrypter } from 'app/libs/db-connector/crypter/encrypter.class';
import { DbConnectorInstance, Insertor } from 'app/libs/db-connector/models/executers';
import { Db } from 'mongodb';

/**
 * Implements insertor for MongoDB
 */
export class DbInsertor<E> implements Insertor<E> {

  /**
   * Creates an instance of db insertor.
   * @param section the section in which to insert the new element
   * @param element the element to insert
   */
  constructor(
    private dbConnector: DbConnectorInstance<Db>,
    private section: keyof AbstractModel,
    private element: E
  ) { }

  /**
   * Checks the DB is connected, if not it esablishes a connection, and then calls doInsert
   * 
   * @see doInsert
   */
  public async autoInsert(): Promise<void> {
    if (this.dbConnector.dbStore['client'] && this.dbConnector.dbStore['client'].isConnected())
      return this.doInsert();

    await this.dbConnector.dbStore.initDB();

    return this.autoInsert();
  }

  /**
   * Encrypts data and then inserts the element in the DB
   */
  private async doInsert(): Promise<void> {
    if (this.dbConnector.options.encrypted)
      await this.handleEncryption();

    await this.dbConnector.dbStore.db.collection(this.dbConnector.DS[this.section].name).insertOne(this.element);
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
