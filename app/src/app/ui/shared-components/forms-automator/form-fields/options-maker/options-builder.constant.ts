import { FORM_COMPONENTS_CODES, OptionKeysModel } from '@anita/client/data/model/form-model-commons';
import { FormFieldsModel } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';

const commonFields: FormFieldsModel<OptionKeysModel> = {
  componentCode: FORM_COMPONENTS_CODES.basicInput,
  fieldName: 'txt',
  type: 'text',
  label: 'Text of the answer',
  validators: {
    required: true
  }
};

/**
 * Defines the Form model to create the options of a `select` or `radio` element.
 *
 * @remarks
 * For adding options only, some properties can't be changed after the filed has been created. Existing items must use `optionsBuilderForEditing` instead.
 */
export const optionsBuilderForAdding: Array<Array<FormFieldsModel<OptionKeysModel>>> = [
  [
    {
      componentCode: FORM_COMPONENTS_CODES.basicInput,
      fieldName: 'value',
      type: 'text',
      label: 'Value',
      validators: {
        required: true
      }
    },
    commonFields
  ]
];

/**
 * Defines the Form model to edit the options of a `select` or `radio` element.
 *
 * @remarks
 * For existing fields only, some properties can't be changed after the filed has been created. New items must use `optionsBuilderForAdding` instead.
 */
export const optionsBuilderForEditing: Array<Array<FormFieldsModel<OptionKeysModel>>> = [
  [
    {
      componentCode: FORM_COMPONENTS_CODES.basicInput,
      fieldName: 'value',
      type: 'text',
      label: 'Value',
      readonly: true,
      validators: {
        required: true
      }
    },
    commonFields
  ]
];
