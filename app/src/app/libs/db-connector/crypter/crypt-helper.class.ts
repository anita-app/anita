import { AbstractModel } from '@anita/client/libs/db-connector/constants/ds.constant';
import { securePassEncrypter } from '@anita/client/libs/db-connector/crypter/options.constant';
import { stringCrypter } from '@anita/client/libs/db-connector/crypter/string-crypter.function';
import { stringDecrypter } from '@anita/client/libs/db-connector/crypter/string-decrypter.function';
import { DbConnectorInstance } from '@anita/client/libs/db-connector/models/executers';
import { Logger } from '@anita/client/libs/logger/logger.class';

/**
 * Common methods needed to crypt and decrypt data, when data encryption in the DB is enabled.
 */
export class CryptHelper<E, DbTypes> {

  /**
   * User keys stored as static Object for fast retrieval from memory.
   * The key of the Object is the string concatenation of the user and the undecrypted key to avoid collisions between projects/users.
   */
  private static userKeys: { [keyIdentifier: string]: string } = {};
  private owner: string;
  private undecryptedKey: string;
  private keyIdentifier: string;

  /**
   * Encrypts the user key using the securePassEncrypter.
   */
  public static decryptUserKey(keyToEncrypt: string): string {
    return stringCrypter(keyToEncrypt, securePassEncrypter);
  }

  /**
   * Creates an instance of Decrypter.
   * @param section the section definition, needed to know which fields should be decrypted.
   * @param element the element to be decrypted.
   */
  constructor(
    protected dbConnector: DbConnectorInstance<DbTypes>,
    protected section: keyof AbstractModel,
    protected element: E
  ) { }

  /**
   * Returns the unencrypted key of the owner of the element, if an emcrypted key for the user was provided when initializing DbInit.
   */
  protected getUserKey(): string {
    this.setOwner();
    this.setUndecryptedKey();

    if (!this.undecryptedKey)
      return undefined;

    this.makeKeyIdentifier();

    if (CryptHelper.userKeys[this.keyIdentifier])
      return this.returnUserUnencryptedKey();

    this.decryptUserKey();

    return this.returnUserUnencryptedKey();
  }

  /**
   * Logs no key error.
   */
  protected logNoKeyError(): void {
    Logger.error(`ERROR: skipping encryption as no key was found for user ${this.owner}. Did you forget to pass the user key in the options when initializing DbInit?`);
  }
  /**
   * Sets the id of the owner of the element being processed.
   */
  private setOwner(): void {
    const owner = this.element[this.dbConnector.DS[this.section].ownerIdentifier];
  }

  /**
   * Sets the undecrypted key of the owner if one was found in dbConnector.options, otherwise `undefined`
   */
  private setUndecryptedKey(): void {
    this.undecryptedKey = (typeof this.dbConnector.options.encryptionKeys === 'object' && this.dbConnector.options.encryptionKeys[this.owner]) ? this.dbConnector.options.encryptionKeys[this.owner] : undefined;
  }

  /**
   * Makes the identifier of the unencryyypted key by concatenating the `string` of the `owner` and the `string` of the encrypted key.
   */
  private makeKeyIdentifier(): void {
    this.keyIdentifier = `${this.owner}${this.undecryptedKey}`;
  }

  /**
   * Decrypts the user key using the securePassEncrypter.
   */
  private decryptUserKey(): void {
    CryptHelper.userKeys[this.keyIdentifier] = stringDecrypter(this.undecryptedKey, securePassEncrypter);
  }

  /**
   * Returns the user unencrypted key retrieving it from the store in memory.
   */
  private returnUserUnencryptedKey(): string {
    return CryptHelper.userKeys[this.keyIdentifier];
  }

}
