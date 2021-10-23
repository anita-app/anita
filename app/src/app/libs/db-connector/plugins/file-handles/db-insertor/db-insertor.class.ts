import { AnitaUniversalDataStorage, RESERVED_UDS_KEYS } from '@anita/client/data/model/project-info';
import { AbstractModel } from '@anita/client/libs/db-connector/constants/ds.constant';
import { Encrypter } from '@anita/client/libs/db-connector/crypter/encrypter.class';
import { DbConnectorInstance, Insertor } from '@anita/client/libs/db-connector/models/executers';
import { ElementAdderToCollection } from '@anita/client/libs/db-connector/plugins/file-handles/helpers/element-adder-to-collection.class';

/**
 * Implements insertor for MySql
 */
export class DbInsertor<E> extends ElementAdderToCollection<E> implements Insertor<E> {

  /**
   * Creates an instance of db insertor.
   * @param dbConnector the instance of DbConnector from which insertor is called
   * @param section the section in which to insert the new element
   * @param element the element to insert
   */
  constructor(
    dbConnector: DbConnectorInstance<AnitaUniversalDataStorage>,
    section: keyof AbstractModel,
    element: E
  ) {
    super(dbConnector, section, element);
  }

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
