import { Encrypter } from 'app/libs/db-connector/crypter/encrypter.class';
import { AbstractModel } from 'app/libs/db-connector/models/abstract-model';
import { DbConnectorInstance, Updator } from 'app/libs/db-connector/models/executers';
import { Database } from 'sql.js';

/**
 * Implements updator for MySql
 */
export class DbUpdator<E> implements Updator<E> {


  /**
 * Creates an instance of db ElementAdderToCollection.
 * @param dbConnector the instance of DbConnector from which ElementAdderToCollection is called
 * @param section the section in which to insert the new element
 * @param element the element to insert
 */
  constructor(
    protected dbConnector: DbConnectorInstance<Database>,
    protected section: keyof AbstractModel,
    protected elements: Array<Partial<E>> | Partial<E>
  ) { }
  /**
   * Updates an element in the collection
   */
  public async autoUpdate(): Promise<void> {
    if (this.dbConnector.options.encrypted)
      await this.handleEncryption();

    // TODO
  }

  /**
   * Handles encryption
   * 
   * @see Encrypter 
   */
  private async handleEncryption(): Promise<void> {
    if (this.elements instanceof Array) {
      for (const element of this.elements)
        await new Encrypter(this.dbConnector, this.section, element).do();
    } else {
      await new Encrypter(this.dbConnector, this.section, this.elements).do();
    }
  }

}
