import {
  FORM_COMPONENTS_CODES,
  FormEleWidths,
  InputTypes,
  OptionKeysModel,
  Prerequisites
  } from '@anita/client/data/model/form-model-commons';
import { ProjectSettings, SectionCustomFieldProperties, SectionDetailsDeclaration } from '@anita/client/data/model/project-info';

export type FormFieldsModel<T> = BasicInput<T> | BasicCheckbox<T> | BasicSelect<T> | BasicRadio<T> | BasicTextarea<T> | HiddenInput<T> | OptionsMaker<T> | DatePicker<T> | DateTimePicker<T>;

export type SupportedFormsTypes = ProjectSettings | SectionCustomFieldProperties | SectionDetailsDeclaration | OptionKeysModel;

export type FormModel<T = FormFieldsModel<SupportedFormsTypes>> = Array<Array<T>>;

export interface HiddenInput<T> extends CommonTypes<T> {
  componentCode: FORM_COMPONENTS_CODES.hiddenInput;
  validators?: any;
  value?: string | (() => string);
}

export interface BasicInput<T> extends CommonTypes<T> {
  componentCode: FORM_COMPONENTS_CODES.basicInput;
  type: InputTypes;
  value?: string;
  validators?: {
    required?: boolean;
    minLength?: number;
    email?: boolean;
    usernameTaken?: boolean;
    userMustExist?: boolean;
    addSelf?: boolean;
  };
}

export interface BasicTextarea<T> extends CommonTypes<T> {
  componentCode: FORM_COMPONENTS_CODES.basicTextarea;
  value?: string;
  validators?: {
    required: boolean;
  };
}

export interface BasicCheckbox<T> extends CommonTypes<T> {
  componentCode: FORM_COMPONENTS_CODES.basicCheckbox;
  value?: boolean;
  description?: string;
  validators?: {
    requiredTrue?: boolean
  };
}

export interface BasicRadio<T> extends CommonTypes<T> {
  componentCode: FORM_COMPONENTS_CODES.basicRadio;
  options: Array<OptionKeysModel>;
  value?: string | number;
  validators?: {
    required: boolean;
  };
}

export interface BasicSelect<T> extends CommonTypes<T> {
  componentCode: FORM_COMPONENTS_CODES.basicSelect;
  options: Array<OptionKeysModel>;
  value?: string | number;
  validators?: {
    required: boolean;
  };
}

export interface OptionsMaker<T> extends CommonTypes<T> {
  componentCode: FORM_COMPONENTS_CODES.optionsMaker;
  value?: string | number;
  type: 'text';
  validators?: {
    required: boolean;
  };
}

export interface DatePicker<T> extends CommonTypes<T> {
  componentCode: FORM_COMPONENTS_CODES.datePicker;
  value?: string;
  validators?: {
    required: boolean;
  };
}

export interface DateTimePicker<T> extends CommonTypes<T> {
  componentCode: FORM_COMPONENTS_CODES.datePicker;
  value?: string;
  validators?: {
    required: boolean;
  };
}

interface CommonTypes<T> {
  componentCode: FORM_COMPONENTS_CODES;
  fieldName?: keyof T & string;
  label?: string;
  readonly?: boolean;
  disabled?: boolean;
  prerequisites?: Array<Prerequisites>;
  width?: FormEleWidths;
  externalLabel?: boolean;
}
