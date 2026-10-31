import { SHA256 } from 'crypto-es'
import { IdCreator } from 'app/libs/id-creator/id-creator.class'

const webCryptoSha256 = async (value: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
}

describe('IdCreator', () => {
  it('hashes with standard SHA-256, as hex', () => {
    // Test vector of FIPS 180-2.
    expect(SHA256('abc').toString()).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
  })

  it('encodes text as UTF-8, like the Web Crypto API', async () => {
    const value = 'Città · 2026-10-31T09:00:00.000Z1234'
    expect(SHA256(value).toString()).toBe(await webCryptoSha256(value))
  })

  it('makes ids of 64 hex characters, different each time', () => {
    const ids = [IdCreator.make('section'), IdCreator.make('section'), IdCreator.random(), IdCreator.random()]
    ids.forEach(id => expect(id).toMatch(/^[0-9a-f]{64}$/))
    expect(new Set(ids).size).toBe(ids.length)
  })
})
