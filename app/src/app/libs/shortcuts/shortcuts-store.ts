export interface IShortcut {
  id?: string
  key: string
  withMetakey?: boolean
  withShift?: boolean
  skipIfInsideInput?: boolean
  callback: (...args: Array<any>) => void
}

export interface IShortcutsByKey {
  [key: string]: Array<IShortcut>
}
interface IShortcutsStore {
  plain: IShortcutsByKey
  withMetaKey: IShortcutsByKey
  withShift: IShortcutsByKey
  withMetaKeyAndShift: IShortcutsByKey
}

export const SHORTCUTS_STORE: IShortcutsStore = {
  plain: {},
  withMetaKey: {},
  withShift: {},
  withMetaKeyAndShift: {}
}
