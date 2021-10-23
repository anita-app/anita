import { AnitaUniversalDataStorage } from '@anita/client/data/model/project-info';
import { AbstractModel } from '@anita/client/libs/db-connector/constants/ds.constant';
import { Encrypter } from '@anita/client/libs/db-connector/crypter/encrypter.class';
import { DbConnectorInstance, Updator } from '@anita/client/libs/db-connector/models/executers';
import { ElementAdderToCollection } from '@anita/client/libs/db-connector/plugins/file-handles/helpers/element-adder-to-collection.class';

/**
 * Implements updator for MySql
 */
export class DbUpdator<E> extends ElementAdderToCollection<E> implements Updator<E> {

  /**
   * Creates an instance of db updator.
   * @param dbConnector the instance of DbConnector from which updator is called
   * @param section the section of the element to update
   * @param element the element to update
   */
  constructor(
    dbConnector: DbConnectorInstance<AnitaUniversalDataStorage>,
    section: keyof AbstractModel,
    element: Partial<E>
  ) {
    super(dbConnector, section, element);
  }

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
