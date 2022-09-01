import CryptoES from 'crypto-es'

/**
 * Encrypts a string
 *
 * @param value the value to encrypt
 * @param keyToUse the key to use for encryption
 * @return the encrypted string
 */
export function stringCrypter (value: string, keyToUse: string): string {
  const encrypted = CryptoES.AES.encrypt(value, keyToUse)
  return encrypted.toString()
}
