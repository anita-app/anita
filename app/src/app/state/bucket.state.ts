import { getDefaultStore } from 'jotai'

/**
 * @internal
 */
export class Bucket {
  static general: ReturnType<typeof getDefaultStore>

  public static createStore () {
    this.general = getDefaultStore()
  }
}
