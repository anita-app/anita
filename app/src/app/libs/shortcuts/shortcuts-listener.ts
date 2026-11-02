import { KEYBOARD } from 'app/const/keyboard.const'
import { SHORTCUTS_STORE } from 'app/libs/shortcuts/shortcuts-store'
import { Keyboard } from 'app/libs/tools/keyboard.class'
import type { IShortcut, IShortcutsByKey } from 'app/libs/shortcuts/shortcuts-store'

/**
 * @feature navigation.keyboard-shortcuts
 * @title Keyboard shortcuts
 * @summary Some actions can be done from the keyboard; the shortcuts follow the same rules everywhere in the app.
 * @where Anywhere in the app with a keyboard; each shortcut works on the page that offers it.
 * @usage Press the keys of the shortcut while the page that offers it is open.
 * @options none
 * @rules Mod means Cmd on macOS and Ctrl on Windows, Linux and other systems.
 * Letters work in upper or lower case.
 * Shortcuts made of a single key are ignored while you type in a text box (single-line or multi-line), so typing a letter never triggers them; shortcuts with Mod work also while typing.
 * A shortcut works only while the page or panel that offers it is shown; when two open parts offer the same keys, the one opened last wins.
 * @errors none
 * @status stable
 * @since 0.18.1
 */
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
