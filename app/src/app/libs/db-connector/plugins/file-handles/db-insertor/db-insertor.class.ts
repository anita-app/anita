import { Encrypter } from 'app/libs/db-connector/crypter/encrypter.class';
import { Insertor } from 'app/libs/db-connector/models/executers';
import { ElementAdderToCollection } from 'app/libs/db-connector/plugins/file-handles/helpers/element-adder-to-collection.class';

/**
 * Implements insertor for MySql
 */
export class DbInsertor<E> extends ElementAdderToCollection<E> implements Insertor<E> {

  /**
   * Adds an element to the collection
   */
  public async autoInsert(): Promise<void> {
    if (this.dbConnector.options.encrypted)
      await this.handleEncryption();

    await this.save();
  }

  /**
   * Handles encryption with Encrypter
   * 
   * @see Encrypter
   */
  private async handleEncryption(): Promise<void> {
    await new Encrypter(this.dbConnector, this.section, this.element).do();
  }

}
