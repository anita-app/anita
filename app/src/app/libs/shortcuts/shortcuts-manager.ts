import { IShortcut, IShortcutsByKey, SHORTCUTS_STORE } from 'app/libs/shortcuts/shortcuts-store'

export class ShortcutsManager {
  public static add (shortcut: IShortcut): void {
    const shortcutsByKey = this.getShortcutsStore(shortcut)
    shortcutsByKey[shortcut.key] = shortcutsByKey[shortcut.key] || []
    shortcutsByKey[shortcut.key].unshift(shortcut)
  }

  public static remove (shortcut: IShortcut): void {
    const shortcutsByKey = this.getShortcutsStore(shortcut)
    if (shortcutsByKey[shortcut.key]) {
      shortcutsByKey[shortcut.key] = shortcutsByKey[shortcut.key].filter(s => s.id !== shortcut.id)
    }
  }

  private static getShortcutsStore (shortcut: IShortcut): IShortcutsByKey {
    switch (true) {
      case shortcut.withMetakey && shortcut.withShift:
        return SHORTCUTS_STORE.withMetaKeyAndShift
      case shortcut.withMetakey:
        return SHORTCUTS_STORE.withMetaKey
      case shortcut.withShift:
        return SHORTCUTS_STORE.withShift
      default:
        return SHORTCUTS_STORE.plain
    }
  }
}
