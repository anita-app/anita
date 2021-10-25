import CryptoES from 'crypto-es';

/**
 * Randomly generated strings hasehd with sha256 to be used as unique identifiers
 */
export class IdCreator {

  /**
   * Makes a unique random string with the a name 
   */
  public static make(name: string): string {

    const aliasDate = new Date(new Date().toUTCString()).toISOString();
    const randNumber = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;

    const id = `${name}${aliasDate}${randNumber}`;

    return CryptoES.SHA256(id).toString();
  }

  /**
   * Makes a unique completely random string
   */
  public static random(): string {

    const aliasDate = new Date(new Date().toUTCString()).toISOString();
    const randNumber = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;

    const id = `${aliasDate}${randNumber}`;

    return CryptoES.SHA256(id).toString();
  }

}
