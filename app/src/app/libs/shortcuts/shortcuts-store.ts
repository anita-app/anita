/**
 * @internal
 */
export interface IShortcut {
  id?: string
  key: string
  withMetaKey?: boolean
  withShift?: boolean
  skipIfInsideInput?: boolean
  callback: (...args: Array<any>) => void
}

/**
 * @internal
 */
export interface IShortcutsByKey {
  [key: string]: Array<IShortcut>
}
interface IShortcutsStore {
  plain: IShortcutsByKey
  withMetaKey: IShortcutsByKey
  withShift: IShortcutsByKey
  withMetaKeyAndShift: IShortcutsByKey
}

/**
 * @internal
 */
export const SHORTCUTS_STORE: IShortcutsStore = {
  plain: {},
  withMetaKey: {},
  withShift: {},
  withMetaKeyAndShift: {},
}
