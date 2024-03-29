import { RESERVED_FIELDS } from 'app/models/reserved-fields.constant'
import { CryptHelper } from 'app/libs/db-connector/crypter/crypt-helper.class'
import { stringCrypter } from 'app/libs/db-connector/crypter/string-crypter.function'

/**
 * Encrypts one element at a time.
 */
export class Encrypter<E, DbTypes> extends CryptHelper<E, DbTypes> {
  /**
   * Retrieves the key to encrypt and loops over all fields to decrypt.
   */
  public async do (): Promise<void> {
    const keyToUse = this.getUserKey()

    if (keyToUse === undefined) {
      return this.logNoKeyError()
    }

    for (const fieldName in this.element) {
      if (!Object.values(RESERVED_FIELDS).includes(fieldName as any)) {
        this.encrypt(keyToUse, fieldName)
      }
    }
  }

  /**
   * Encrypts the value of the given key.
   *
   * @param keyToUse the key to be used for encryption.
   * @param fieldName the key of the field to encrypt.
   */
  private encrypt (keyToUse: string, fieldName: keyof E): void {
    if (this.element[fieldName]) {
      this.element[fieldName] = stringCrypter(this.element[fieldName] as unknown as string, keyToUse) as unknown as E[keyof E]
    }
  }
}
