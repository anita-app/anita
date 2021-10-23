import CryptoES from 'crypto-es';

/**
 * Decrypts a string
 *
 * @param value the value to decrypt
 * @param keyToUse the key to use for decryption
 * @return the decrypted string
 */
export function stringDecrypter(value: string, keyToUse: string): string {
  const decrypted = CryptoES.AES.decrypt(value, keyToUse);
  return decrypted.toString();
}
