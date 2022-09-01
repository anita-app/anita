import { Encrypter } from 'app/libs/DbConnector/crypter/encrypter.class'
import { Insertor } from 'app/libs/DbConnector/models/executers'
import { ElementAdderToCollection } from 'app/libs/DbConnector/plugins/file-handles/helpers/element-adder-to-collection.class'

/**
 * Implements insertor for MySql
 */
export class DbInsertor<E> extends ElementAdderToCollection<E> implements Insertor<E> {
  /**
   * Adds an element to the collection
   */
  public async autoInsert (): Promise<void> {
    if (this.dbConnector.options.encrypted) {
      await this.handleEncryption()
    }

    await this.save()
  }

  /**
   * Handles encryption with Encrypter
   *
   * @see Encrypter
   */
  private async handleEncryption (): Promise<void> {
    if (this.elements instanceof Array) {
      for (const element of this.elements) {
        await new Encrypter(this.dbConnector, this.section, element).do()
      }
    } else {
      await new Encrypter(this.dbConnector, this.section, this.elements).do()
    }
  }
}
