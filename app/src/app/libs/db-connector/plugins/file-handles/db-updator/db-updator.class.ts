import { Encrypter } from 'app/libs/db-connector/crypter/encrypter.class';
import { Updator } from 'app/libs/db-connector/models/executers';
import { ElementAdderToCollection } from 'app/libs/db-connector/plugins/file-handles/helpers/element-adder-to-collection.class';

/**
 * Implements updator for MySql
 */
export class DbUpdator<E> extends ElementAdderToCollection<E> implements Updator<E> {

  /**
   * Updates an element in the collection
   */
  public async autoUpdate(): Promise<void> {
    if (this.dbConnector.options.encrypted)
      await this.handleEncryption();

    await this.save();
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
