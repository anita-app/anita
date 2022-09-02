import {
  IProjectSettings,
  ISectionCustomFieldProperties,
  SectionDetailsDeclaration,
  SectionElement
} from 'app/data/project-structure/project-info'
import { FORM_COMPONENTS_CODES } from 'app/components/shared-components/forms-automator/form-component-codes.enum'
import { TextInputSupportedTypes } from 'app/components/shared-components/forms-automator/input-supported-types.const'
import { TIconName } from 'app/libs/Icons/Icons.class'

export type FormFieldsModel<T extends TSupportedFormsTypes = TSupportedFormsTypes> = IBasicInput<T> | IBasicCheckbox<T> | IBasicSelect<T> | IBasicRadio<T> | IBasicTextarea<T> | IHiddenInput<T> | IOptionsMaker<T> | IDatePicker<T> | IDateTimePicker<T>;

export type TFormFieldWithOptions<T extends TSupportedFormsTypes = TSupportedFormsTypes> = FormFieldsModel<T> & { options: Array<IOptionKeysModel> };

export type TSupportedFormsTypes = IProjectSettings | SectionElement | ISectionCustomFieldProperties | SectionDetailsDeclaration | IOptionKeysModel;

export type FormModel<T = FormFieldsModel<TSupportedFormsTypes>> = Array<T>;

export type FormAutomatorOnChangeValue = string | number | boolean | Array<string>;

export interface ICommonFormEleProps<T = FormFieldsModel<TSupportedFormsTypes>> {
  formEle: T;
  element: Partial<SectionElement>;
  handleChange: (fieldName: string, value: FormAutomatorOnChangeValue) => void;
  [customProps: string]: any;
}

/**
 * Defines the Object that contains the prerequisite necessary to show a field of a form.
 * The key of the Object is the identifier of the field whose value must be checked.
 * The value of each key is an Array of all the possible values that fulfill the prerequsite.
 */
export interface Prerequisites {
  [fieldToCheckIdentifier: string]: Array<string | number | boolean>;
}

interface IHiddenInput<T> extends ICommonTypes<T> {
  componentCode: FORM_COMPONENTS_CODES.hiddenInput;
  required?: boolean;
  value?: string | (() => string);
}

interface IBasicInput<T> extends ICommonTypes<T> {
  componentCode: FORM_COMPONENTS_CODES.basicInput
  type: TextInputSupportedTypes
  value?: string
  required?: boolean
}

interface IBasicTextarea<T> extends ICommonTypes<T> {
  componentCode: FORM_COMPONENTS_CODES.basicTextarea;
  value?: string;
  required?: boolean;
}

interface IBasicCheckbox<T> extends ICommonTypes<T> {
  componentCode: FORM_COMPONENTS_CODES.basicCheckbox;
  value?: boolean;
  description?: string;
  required?: boolean
  type?: never
}

/**
 * Defines the structure of possible choices to be selected in a Radio or Select html element.
 */
export interface OptionKeysModelGroup {
  label: string;
  options: Array<IOptionKeysModel>;
}

/**
 * Defines the structure of possible choices to be selected in a Radio or Select html element.
 */
export interface IOptionKeysModel {
  value?: string | number
  label?: string
  disabled?: boolean
  hint?: string
  icon?: TIconName
}

export interface IBasicRadio<T> extends ICommonTypes<T> {
  componentCode: FORM_COMPONENTS_CODES.basicRadio;
  options: Array<IOptionKeysModel>;
  value?: string | number;
  required?: boolean;
}

export interface IBasicSelect<T> extends ICommonTypes<T> {
  componentCode: FORM_COMPONENTS_CODES.basicSelect | FORM_COMPONENTS_CODES.childOfSelectorForSection | FORM_COMPONENTS_CODES.parentsSelector;
  options: Array<IOptionKeysModel>;
  value?: string | number;
  required?: boolean;
}

interface IOptionsMaker<T> extends ICommonTypes<T> {
  componentCode: FORM_COMPONENTS_CODES.optionsMaker;
  value?: string | number;
  type: TextInputSupportedTypes.text;
  required?: boolean;
}

interface IDatePicker<T> extends ICommonTypes<T> {
  componentCode: FORM_COMPONENTS_CODES.datePicker;
  value?: string;
  required?: boolean;
}

interface IDateTimePicker<T> extends ICommonTypes<T> {
  componentCode: FORM_COMPONENTS_CODES.dateTimePicker;
  value?: string;
  required?: boolean;
}

interface ICommonTypes<T> {
  componentCode: FORM_COMPONENTS_CODES
  fieldName?: keyof T & string
  label?: string
  disabled?: boolean
  readonly?: boolean
  prerequisites?: Array<Prerequisites>
  width?: string
  externalLabel?: boolean
  type?: never | TextInputSupportedTypes
}
