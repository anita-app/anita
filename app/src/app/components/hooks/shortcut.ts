import { useEffect, useId } from 'react'
import { ShortcutsManager } from 'app/libs/shortcuts/shortcuts-manager'
import type { IShortcut } from 'app/libs/shortcuts/shortcuts-store'

export const useShortcut = (shortcut: IShortcut) => {
  // Stable for the life of the component, without computing anything during render.
  const shortcutId = useId()
  useEffect(() => {
    shortcut.id = shortcutId
    ShortcutsManager.add(shortcut)
    return () => {
      ShortcutsManager.remove({ ...shortcut, id: shortcutId })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
