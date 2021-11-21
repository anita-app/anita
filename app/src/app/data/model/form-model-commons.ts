/**
 * Defines the Object that contains the prerequisite necessary to show a field of a form.
 * The key of the Object is the identifier of the field whose value must be checked.
 * The value of each key is an Array of all the possible values that fulfill the prerequsite.
 */
export interface Prerequisites {
  [fieldToCheckIdentifier: string]: Array<string | number | boolean>;
}

/**
 * Supported input types.
 */
export type InputTypes = 'color' | 'date' | 'datetime-local' | 'email' | 'hidden' | 'month' | 'number' | 'password' | 'range' | 'reset' | 'tel' | 'text' | 'time' | 'url' | 'week';

/**
 * Supported css classes defining the width of each field of a row of a form.
 */
export type FormEleWidths = string;

/**
 * Defines the structure of possible choices to be selected in a Radio or Select html element.
 */
export interface OptionKeysModelGroup {
  label: string;
  options: Array<OptionKeysModel>;
}

/**
 * Defines the structure of possible choices to be selected in a Radio or Select html element.
 */
export interface OptionKeysModel {
  value: string | number;
  label: string;
}

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
    label: 'Date & time picker'
  }
];
