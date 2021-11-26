import { FORM_COMPONENTS_CODES, OptionKeysModel } from 'app/data/model/form-model-commons';
import { FormFieldsModel } from 'app/ui-react-components/shared-components/forms-automator/form-fields/form-fields-model';

const commonFieldsAdvanced: FormFieldsModel<OptionKeysModel> = {
  componentCode: FORM_COMPONENTS_CODES.basicInput,
  fieldName: 'label',
  type: 'text',
  label: 'Label',
  required: true,
  width: "8"
};

const commonFieldsBasic: FormFieldsModel<OptionKeysModel> = {
  componentCode: FORM_COMPONENTS_CODES.basicInput,
  fieldName: 'label',
  type: 'text',
  label: 'Label',
  required: true,
  width: "11"
};

/**
 * Defines the Form model to create the options of a `select` or `radio` element.
 *
 * @remarks
 * For adding options only, some properties can't be changed after the filed has been created. Existing items must use `optionsBuilderForEditingAdvanced` instead.
 */
export const optionsBuilderForAddingAdvanced: Array<FormFieldsModel<OptionKeysModel>> = [
  {
    componentCode: FORM_COMPONENTS_CODES.basicInput,
    fieldName: 'value',
    type: 'text',
    label: 'Value',
    required: true,
    width: "3"
  },
  commonFieldsAdvanced
];

export const optionsBuilderForAddingBasic: Array<FormFieldsModel<OptionKeysModel>> = [
  {
    componentCode: FORM_COMPONENTS_CODES.hiddenInput,
    fieldName: 'value'
  },
  commonFieldsBasic
];

/**
 * Defines the Form model to edit the options of a `select` or `radio` element.
 *
 * @remarks
 * For existing fields only, some properties can't be changed after the filed has been created. New items must use `optionsBuilderForAddingAdvanced` instead.
 */
export const optionsBuilderForEditingAdvanced: Array<FormFieldsModel<OptionKeysModel>> = [
  {
    componentCode: FORM_COMPONENTS_CODES.basicInput,
    fieldName: 'value',
    type: 'text',
    label: 'Value',
    disabled: true,
    required: true,
    width: "3"
  },
  commonFieldsAdvanced

];
export const optionsBuilderForEditingBasic: Array<FormFieldsModel<OptionKeysModel>> = [
  {
    componentCode: FORM_COMPONENTS_CODES.hiddenInput,
    fieldName: 'value'
  },
  commonFieldsBasic

];
