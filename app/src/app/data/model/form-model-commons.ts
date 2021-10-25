import { BasicCheckboxComponent } from '@anita/client/ui/shared-components/forms-automator/form-fields/basic-checkbox/basic-checkbox.component';
import { BasicInputComponent } from '@anita/client/ui/shared-components/forms-automator/form-fields/basic-input/basic-input.component';
import { BasicRadioComponent } from '@anita/client/ui/shared-components/forms-automator/form-fields/basic-radio/basic-radio.component';
import { BasicSelectComponent } from '@anita/client/ui/shared-components/forms-automator/form-fields/basic-select/basic-select.component';
import { BasicTextareaComponent } from '@anita/client/ui/shared-components/forms-automator/form-fields/basic-textarea/basic-textarea.component';
import { ChildOfSelectorForSectionComponent } from '@anita/client/ui/shared-components/forms-automator/form-fields/child-of-selector-for-section/child-of-selector-for-section.component';
import { DatePickerComponent } from '@anita/client/ui/shared-components/forms-automator/form-fields/date-picker/date-picker.component';
import { DateTimePickerComponent } from '@anita/client/ui/shared-components/forms-automator/form-fields/date-time-picker/date-time-picker.component';
import { HiddenInputComponent } from '@anita/client/ui/shared-components/forms-automator/form-fields/hidden-input/hidden-input.component';
import { OptionsMakerComponent } from '@anita/client/ui/shared-components/forms-automator/form-fields/options-maker/options-maker.component';
import { ParentsSelectorComponent } from '@anita/client/ui/shared-components/forms-automator/form-fields/parents-selector/parents-selector.component';

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
export type FormEleWidths = 'col-md-1' | 'col-md-2' | 'col-md-3' | 'col-md-4' | 'col-md-5' | 'col-md-6' | 'col-md-7' | 'col-md-8' | 'col-md-9' | 'col-md-10' | 'col-md-11' | 'col-md-12';

/**
 * Defines the structure of possible choices to be selected in a Radio or Select html element.
 */
export interface OptionKeysModel {
  value: string | number;
  txt: string;
}

/**
 * Values to identify the form component to dynamically load.
 *
 * @remarks
 * These values are stored in each `Section` in `AnitaUniversalDataStorage['sections']` so their number __must__ not be changed. Element can be added freely.
 */
export const enum FORM_COMPONENTS_CODES {
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
 * Identifies the Component based on its code.
 * Necessary for converting the code saved in the project's structure to an html element.
 */
export const COMPONENT_CODE_TO_COMPONENT = {
  [FORM_COMPONENTS_CODES.hiddenInput]: HiddenInputComponent,
  [FORM_COMPONENTS_CODES.basicInput]: BasicInputComponent,
  [FORM_COMPONENTS_CODES.basicTextarea]: BasicTextareaComponent,
  [FORM_COMPONENTS_CODES.basicCheckbox]: BasicCheckboxComponent,
  [FORM_COMPONENTS_CODES.basicRadio]: BasicRadioComponent,
  [FORM_COMPONENTS_CODES.basicSelect]: BasicSelectComponent,
  [FORM_COMPONENTS_CODES.optionsMaker]: OptionsMakerComponent,
  [FORM_COMPONENTS_CODES.datePicker]: DatePickerComponent,
  [FORM_COMPONENTS_CODES.dateTimePicker]: DateTimePickerComponent,
  [FORM_COMPONENTS_CODES.childOfSelectorForSection]: ChildOfSelectorForSectionComponent,
  [FORM_COMPONENTS_CODES.parentsSelector]: ParentsSelectorComponent
};

/**
 * Defines the value of the Select element for picking the type of Component for a field.
 */
export const SELECTABLE_FORM_ELES: Array<OptionKeysModel> = [
  {
    value: FORM_COMPONENTS_CODES.basicInput,
    txt: 'Short text'
  },
  {
    value: FORM_COMPONENTS_CODES.basicTextarea,
    txt: 'Long text'
  },
  {
    value: FORM_COMPONENTS_CODES.basicCheckbox,
    txt: 'Check box'
  },
  {
    value: FORM_COMPONENTS_CODES.basicSelect,
    txt: 'Drop-down list'
  },
  {
    value: FORM_COMPONENTS_CODES.basicRadio,
    txt: 'Alternative choice'
  },
  {
    value: FORM_COMPONENTS_CODES.datePicker,
    txt: 'Date picker'
  },
  {
    value: FORM_COMPONENTS_CODES.dateTimePicker,
    txt: 'Date & time picker'
  }
];
