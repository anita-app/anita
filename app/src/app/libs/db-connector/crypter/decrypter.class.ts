import { RESERVED_FIELDS } from 'app/data/project-structure/reserved-fields.constant'
import { CryptHelper } from 'app/libs/db-connector/crypter/crypt-helper.class'
import { stringDecrypter } from 'app/libs/db-connector/crypter/string-decrypter.function'

/**
 * Decrypts one element at a time.
 */
export class Decrypter<E, DbTypes> extends CryptHelper<E, DbTypes> {
  /**
   * Retrieves the key to decrypt and loops over all fields to decrypt.
   */
  public async do (): Promise<void> {
    const keyToUse = this.getUserKey()

    if (keyToUse === undefined) {
      return this.logNoKeyError()
    }

    for (const fieldName in this.element) {
      if (!Object.values(RESERVED_FIELDS).includes(fieldName as any)) {
        this.decrypt(keyToUse, fieldName)
      }
    }
  }

  /**
   * Decrypts the value of the given key.
   *
   * @param keyToUse the key to be used for decryption.
   * @param fieldName the key of the field to decrypt.
   */
  private decrypt (keyToUse: string, fieldName: keyof E): void {
    if (this.element[fieldName]) {
      this.element[fieldName] = stringDecrypter(this.element[fieldName] as unknown as string, keyToUse) as unknown as E[keyof E]
    }
  }
}
