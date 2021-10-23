import { RESERVED_FIELDS } from '@anita/client/data/form-models/system-fields-for-sections.constant';
import { AbstractModel } from '@anita/client/libs/db-connector/constants/ds.constant';
import { CryptHelper } from '@anita/client/libs/db-connector/crypter/crypt-helper.class';
import { stringCrypter } from '@anita/client/libs/db-connector/crypter/string-crypter.function';
import { DbConnectorInstance } from '@anita/client/libs/db-connector/models/executers';

/**
 * Encrypts one element at a time.
 */
export class Encrypter<E, DbTypes> extends CryptHelper<E, DbTypes> {

  /**
   * Creates an instance of Encrypter.
   * @param section the section definition, needed to know which fields should be decrypted.
   * @param element the element to be decrypted.
   */
  constructor(
    dbConnector: DbConnectorInstance<DbTypes>,
    section: keyof AbstractModel,
    element: E
  ) {
    super(dbConnector, section, element);
  }

  /**
   * Retrieves the key to encrypt and loops over all fields to decrypt.
   */
  public async do(): Promise<void> {
    const keyToUse = this.getUserKey();

    if (keyToUse === undefined)
      return this.logNoKeyError();

    for (const fieldName in this.element)
      if (!Object.values(RESERVED_FIELDS).includes(fieldName as any))
        this.encrypt(keyToUse, fieldName);
  }

  /**
   * Encrypts the value of the given key.
   *
   * @param keyToUse the key to be used for encryption.
   * @param fieldName the key of the field to encrypt.
   */
  private encrypt(keyToUse: string, fieldName: string): void {
    if (this.element[fieldName])
      this.element[fieldName] = stringCrypter(this.element[fieldName], keyToUse);
  }

}
