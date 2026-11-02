import { PLATFORM } from 'app/const/platform.const'

/**
 * @featurePart navigation.keyboard-shortcuts
 */
export const KEYBOARD: { MODIFIER_KEY: keyof KeyboardEvent } = {
  MODIFIER_KEY: PLATFORM.IS_MAC ? 'metaKey' : 'ctrlKey',
}
