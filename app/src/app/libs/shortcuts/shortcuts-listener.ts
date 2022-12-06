import { KEYBOARD } from 'app/const/keyboard.const'
import { IShortcut, IShortcutsByKey, SHORTCUTS_STORE } from 'app/libs/shortcuts/shortcuts-store'
import { Keyboard } from 'app/libs/tools/keyboard.class'

export class ShortcutsListener {
  public static init (): void {
    window.addEventListener('keydown', this.handleKeyDown)
  }

  public static handleKeyDown = (e: KeyboardEvent): void | boolean => {
    const shortcuts = this.getShortcuts(e)
    const arrayOfMethods = shortcuts[e.key] || shortcuts[e.key?.toLowerCase()]

    if (!arrayOfMethods?.length) {
      return true
    }

    return this.executeShortcut(e, arrayOfMethods)
  }

  private static getShortcuts (e: KeyboardEvent): IShortcutsByKey {
    const metaKey = e[KEYBOARD.MODIFIER_KEY]

    if (metaKey && e.shiftKey) {
      return SHORTCUTS_STORE.withMetaKeyAndShift
    } else if (metaKey) {
      return SHORTCUTS_STORE.withMetaKey
    } else if (e.shiftKey) {
      return SHORTCUTS_STORE.withShift
    }
    return SHORTCUTS_STORE.plain
  }

  private static executeShortcut (e: KeyboardEvent, arrayOfMethods: Array<IShortcut>): void | boolean {
    const isInsideInput = Keyboard.isTyping(e.target as HTMLElement)
    const shortcutConfig = arrayOfMethods[0]
    if ((!shortcutConfig.skipIfInsideInput || !isInsideInput)) {
      shortcutConfig.callback(e)
    } else {
      return true
    }
  }
}
