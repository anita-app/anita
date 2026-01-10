import { useEffect, useRef } from 'react'
import { ShortcutsManager } from 'app/libs/shortcuts/shortcuts-manager'
import type { IShortcut } from 'app/libs/shortcuts/shortcuts-store'

export const useShortcut = (shortcut: IShortcut) => {
  const shortcutUniqueId = useRef<string>(Math.random().toString(36).substr(2, 9))
  useEffect(() => {
    const shortcutId = shortcutUniqueId.current
    shortcut.id = shortcutId
    ShortcutsManager.add(shortcut)
    return () => {
      ShortcutsManager.remove({ ...shortcut, id: shortcutId })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
