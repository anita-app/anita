import {
  FORM_COMPONENTS_CODES,
  FormEleWidths,
  InputTypes,
  OptionKeysModel,
  Prerequisites
  } from 'app/data/model/form-model-commons';
import {
  ProjectSettings,
  SectionCustomFieldProperties,
  SectionDetailsDeclaration,
  SectionElement
  } from 'app/data/model/project-info';

export type FormFieldsModel<T extends SupportedFormsTypes> = IBasicInput<T> | IBasicCheckbox<T> | IBasicSelect<T> | IBasicRadio<T> | IBasicTextarea<T> | IHiddenInput<T> | IOptionsMaker<T> | IDatePicker<T> | IDateTimePicker<T>;

export type SupportedFormsTypes = ProjectSettings | SectionElement | SectionCustomFieldProperties | SectionDetailsDeclaration | OptionKeysModel;

export type FormModel<T = FormFieldsModel<SupportedFormsTypes>> = Array<T>;

export type FormAutomatorOnChangeValue = string | number | boolean | Array<string>;

export interface ICommonFormEleProps<T = FormFieldsModel<SupportedFormsTypes>> {
  formEle: T;
  element: Partial<SectionElement>;
  handleChange: (fieldName: string, value: FormAutomatorOnChangeValue) => void;
  [customProps: string]: any;
}

interface IHiddenInput<T> extends ICommonTypes<T> {
  componentCode: FORM_COMPONENTS_CODES.hiddenInput;
  required?: boolean;
  value?: string | (() => string);
}
interface IBasicInput<T> extends ICommonTypes<T> {
  componentCode: FORM_COMPONENTS_CODES.basicInput;
  type: InputTypes;
  value?: string;
  required?: boolean;
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
}

export interface IBasicRadio<T> extends ICommonTypes<T> {
  componentCode: FORM_COMPONENTS_CODES.basicRadio;
  options: Array<OptionKeysModel>;
  value?: string | number;
  required?: boolean;
}

export interface IBasicSelect<T> extends ICommonTypes<T> {
  componentCode: FORM_COMPONENTS_CODES.basicSelect | FORM_COMPONENTS_CODES.childOfSelectorForSection | FORM_COMPONENTS_CODES.parentsSelector;
  options: Array<OptionKeysModel>;
  value?: string | number;
  required?: boolean;
}

interface IOptionsMaker<T> extends ICommonTypes<T> {
  componentCode: FORM_COMPONENTS_CODES.optionsMaker;
  value?: string | number;
  type: 'text';
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
  componentCode: FORM_COMPONENTS_CODES;
  fieldName?: keyof T & string;
  label?: string;
  disabled?: boolean;
  readonly?: boolean;
  prerequisites?: Array<Prerequisites>;
  width?: FormEleWidths;
  externalLabel?: boolean;
}
