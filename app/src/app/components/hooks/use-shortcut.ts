import { useEffect, useRef } from 'react'
import { KEYBOARD } from 'app/const/keyboard.const'
import { Keyboard } from 'app/libs/tools/keyboard.class'

interface IShortcut {
  [key: string]: {
    withMetakey?: boolean
    withShift?: boolean
    skipIfInsideInput?: boolean
    callback: (...args: Array<any>) => void
  }
}

export const useShortcut = (shortcuts: IShortcut) => {
  const supportedKeysInLowerCase = useRef<Array<string>>(Object.keys(shortcuts).map(key => key.toLowerCase()))
  const supportedKeys = useRef<Array<string>>(Object.keys(shortcuts))
  useEffect(() => {
    const executeShortcut = (e: KeyboardEvent, indexOfKeyPressedIfSupported: number) => {
      const metaKey = e[KEYBOARD.MODIFIER_KEY]
      const keyPressed = supportedKeys.current[indexOfKeyPressedIfSupported]
      const shortcutConfig = shortcuts[keyPressed]
      const isInsideInput = Keyboard.isTyping(e.target as HTMLElement)
      if ((((shortcutConfig.withMetakey === true && metaKey) || (!shortcutConfig.withMetakey && !metaKey)) && ((shortcutConfig.withShift === true && e.shiftKey) || (!shortcutConfig.withShift && !e.shiftKey))) &&
        (!shortcutConfig.skipIfInsideInput || !isInsideInput)) {
        shortcutConfig.callback(e)
      } else {
        return true
      }
    }
    const handleKeyDown = (e: KeyboardEvent): void | boolean => {
      const indexOfKeyPressedIfSupported = supportedKeysInLowerCase.current.indexOf(e.key?.toLowerCase())

      if (indexOfKeyPressedIfSupported === -1) {
        return true
      }

      return executeShortcut(e, indexOfKeyPressedIfSupported)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
