import { PLATFORM } from 'app/const/platform.const'

export const KEYBOARD: { MODIFIER_KEY: keyof KeyboardEvent } = {
  MODIFIER_KEY: PLATFORM.IS_MAC ? 'metaKey' : 'ctrlKey'
}
