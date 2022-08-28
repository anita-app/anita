import { OptionKeysModel } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types'

/**
 * Values to identify the form component to dynamically load.
 *
 * @remarks
 * These values are stored in each `Section` in `AnitaUniversalDataStorage['sections']` so their number __must__ not be changed. Element can be added freely.
 */
export enum FORM_COMPONENTS_CODES {
  basicInput = 1,
  basicTextarea = 2,
  basicCheckbox = 3,
  basicSelect = 4,
  basicRadio = 5,
  hiddenInput = 6,
  optionsMaker = 7,
  datePicker = 8,
  dateTimePicker = 9,
  childOfSelectorForSection = 10,
  parentsSelector = 11
}

/**
 * Defines the value of the Select element for picking the type of Component for a field.
 */
export const SELECTABLE_FORM_ELES: Array<OptionKeysModel> = [
  {
    value: FORM_COMPONENTS_CODES.basicInput,
    label: 'Short text'
  },
  {
    value: FORM_COMPONENTS_CODES.basicTextarea,
    label: 'Long text'
  },
  {
    value: FORM_COMPONENTS_CODES.basicCheckbox,
    label: 'Check box'
  },
  {
    value: FORM_COMPONENTS_CODES.basicSelect,
    label: 'Drop-down list'
  },
  {
    value: FORM_COMPONENTS_CODES.basicRadio,
    label: 'Alternative choice'
  },
  {
    value: FORM_COMPONENTS_CODES.datePicker,
    label: 'Date picker'
  },
  {
    value: FORM_COMPONENTS_CODES.dateTimePicker,
    label: 'Date & time'
  }
]
