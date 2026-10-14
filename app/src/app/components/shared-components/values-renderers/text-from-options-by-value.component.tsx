import { SectionElement } from 'app/models/section-element/section-element.class'
import type { ReactNode } from 'react'
import type { IOptionKeysModel } from 'app/components/shared-components/forms-automator/form-automator.types'

interface ITextFromOptionsByValueProps {
  value: string | number
}

/** Number of pill colors in ui.css (ui-pill-0 … ui-pill-5). */
const PILL_COLORS = 6

/**
 * The label of the chosen option, as a pill. Its color comes from the position of the option, so the same
 * choice always has the same color.
 */
export const TextFromOptionsByValue = (options: Array<IOptionKeysModel>, field: ITextFromOptionsByValueProps): ReactNode => {
  const label = SectionElement.txtByFieldValue(options, field.value)
  if (label === null) {
    return null
  }
  // Relaxed equal, as in txtByFieldValue: the value might be a string or a number.
  // eslint-disable-next-line eqeqeq
  const index = options.findIndex(option => option.value == field.value)
  return <span className={`ui-pill ui-pill-${index % PILL_COLORS}`}>{label}</span>
}
