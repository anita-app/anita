import { ISectionCustomFieldProperties, SectionDetailsDeclaration } from 'app/data/project-structure/project-info'
import { RESERVED_FIELDS } from 'app/data/project-structure/reserved-fields.constant'
import { FormFieldsModel } from 'app/components/shared-components/forms-automator/form-automator.types'
import { FORM_COMPONENTS_CODES, SELECTABLE_FORM_ELES } from 'app/components/shared-components/forms-automator/form-component-codes.enum'
import {
  DATE_INPUT_SUPPORTED_TYPES_OPTIONS,
  DATE_TIME_INPUT_SUPPORTED_TYPES_OPTIONS,
  DateInputSupportedTypes,
  DateTimeInputSupportedTypes,
  TEXT_INPUT_SUPPORTED_TYPES_OPTIONS,
  TextInputSupportedTypes
} from 'app/components/shared-components/forms-automator/input-supported-types.const'

export const sectionDetailsFormFieldsModel: Array<FormFieldsModel<SectionDetailsDeclaration>> = [
  {
    componentCode: FORM_COMPONENTS_CODES.hiddenInput,
    fieldName: RESERVED_FIELDS.id
  },
  {
    componentCode: FORM_COMPONENTS_CODES.basicInput,
    fieldName: 'title',
    type: TextInputSupportedTypes.text,
    label: 'Section name',
    required: true
  },
  {
    componentCode: FORM_COMPONENTS_CODES.childOfSelectorForSection,
    fieldName: 'childOf',
    label: 'Parent sections:',
    options: []
  }
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const allFieldsExceptBasicInput = Object.entries(FORM_COMPONENTS_CODES).map(([key, value]) => value).filter((value: string | FORM_COMPONENTS_CODES) => (
  ![FORM_COMPONENTS_CODES.basicInput, FORM_COMPONENTS_CODES.datePicker, FORM_COMPONENTS_CODES.dateTimePicker].includes(value as FORM_COMPONENTS_CODES) && typeof value === 'number'
))

const labelsForBasicAndAdvanced = (sizeWithoutInputType: number, sizeWithtInputType: number): Array<FormFieldsModel<ISectionCustomFieldProperties>> => [
  {
    componentCode: FORM_COMPONENTS_CODES.basicInput,
    fieldName: 'label',
    type: TextInputSupportedTypes.text,
    label: 'Field label',
    required: true,
    width: sizeWithoutInputType.toString(),
    prerequisites: [{
      componentCode: [undefined, '', ...allFieldsExceptBasicInput]
    }]
  },
  {
    componentCode: FORM_COMPONENTS_CODES.basicInput,
    fieldName: 'label',
    type: TextInputSupportedTypes.text,
    label: 'Field label',
    required: true,
    width: sizeWithtInputType.toString(),
    prerequisites: [{ componentCode: [FORM_COMPONENTS_CODES.basicInput] }, { componentCode: [FORM_COMPONENTS_CODES.datePicker] }, { componentCode: [FORM_COMPONENTS_CODES.dateTimePicker] }]

  }
]

const componentSelectorForBasicAndAdvanced = (size: number): FormFieldsModel<ISectionCustomFieldProperties> => ({
  componentCode: FORM_COMPONENTS_CODES.basicSelect,
  fieldName: 'componentCode',
  options: SELECTABLE_FORM_ELES,
  value: SELECTABLE_FORM_ELES[0].value,
  label: 'Data type',
  required: true,
  width: size.toString()
})

/**
 * Show the select options for the type of Input element
 */
const inputTypeSelectors: Array<FormFieldsModel<ISectionCustomFieldProperties>> = [
  {
    componentCode: FORM_COMPONENTS_CODES.basicSelect,
    fieldName: 'type',
    options: TEXT_INPUT_SUPPORTED_TYPES_OPTIONS,
    value: TextInputSupportedTypes.text,
    label: 'Content type',
    required: true,
    width: '2',
    prerequisites: [{ componentCode: [FORM_COMPONENTS_CODES.basicInput] }]
  },
  {
    componentCode: FORM_COMPONENTS_CODES.basicSelect,
    fieldName: 'type',
    options: DATE_INPUT_SUPPORTED_TYPES_OPTIONS,
    value: DateInputSupportedTypes.date,
    label: 'Date format',
    required: true,
    width: '2',
    prerequisites: [{ componentCode: [FORM_COMPONENTS_CODES.datePicker] }]
  },
  {
    componentCode: FORM_COMPONENTS_CODES.basicSelect,
    fieldName: 'type',
    options: DATE_TIME_INPUT_SUPPORTED_TYPES_OPTIONS,
    value: DateTimeInputSupportedTypes.datetimeLocal,
    label: 'Time format',
    required: true,
    width: '2',
    prerequisites: [{ componentCode: [FORM_COMPONENTS_CODES.dateTimePicker] }]
  }
]

/**
 * Defines common fields that are used both when creating and editing fields of a `Section`.
 */
const commonAddAndEditFields: Array<FormFieldsModel<ISectionCustomFieldProperties>> = [
  {
    componentCode: FORM_COMPONENTS_CODES.optionsMaker,
    fieldName: 'options',
    type: TextInputSupportedTypes.text,
    label: 'Possible values',
    prerequisites: [{ componentCode: [FORM_COMPONENTS_CODES.basicSelect, FORM_COMPONENTS_CODES.basicRadio] }],
    required: true
  },
  {
    componentCode: FORM_COMPONENTS_CODES.basicCheckbox,
    fieldName: 'required',
    value: false,
    label: 'Required'
  }
]

/**
 * Defines the Form model to set the field properties of a `Section`.
 * All the values specified in each field of `sectionElesNewItemAdvanced` are necessary for creating each field.
 *
 * @remarks
 * For new fields only. Existing items must use `sectionElesForEditingAdvanced` as some properties can't be changed after the filed has been created.
 */
export const sectionElesNewItemAdvanced: Array<FormFieldsModel<ISectionCustomFieldProperties>> = [
  ...labelsForBasicAndAdvanced(7, 5),
  componentSelectorForBasicAndAdvanced(3),
  ...inputTypeSelectors,
  {
    componentCode: FORM_COMPONENTS_CODES.basicInput,
    fieldName: 'fieldName',
    type: TextInputSupportedTypes.text,
    label: 'Identifier',
    required: true,
    width: '2'
  },
  ...commonAddAndEditFields
]

export const sectionElesNewItemBasic: Array<FormFieldsModel<ISectionCustomFieldProperties>> = [
  ...labelsForBasicAndAdvanced(8, 6),
  componentSelectorForBasicAndAdvanced(4),
  ...inputTypeSelectors,
  {
    componentCode: FORM_COMPONENTS_CODES.hiddenInput,
    fieldName: 'fieldName'
  },
  ...commonAddAndEditFields
]

/**
 * Defines the Form model to edit the properties of an existing field of a `Section`.
 *
 * @remarks
 * For existing fields only, some properties can't be changed after the filed has been created. New items must use `sectionElesNewItemAdvanced` instead.
 */
export const sectionElesForEditingAdvanced: Array<FormFieldsModel<ISectionCustomFieldProperties>> = [
  ...labelsForBasicAndAdvanced(7, 5),
  componentSelectorForBasicAndAdvanced(3),
  ...inputTypeSelectors,
  {
    componentCode: FORM_COMPONENTS_CODES.basicInput,
    fieldName: 'fieldName',
    type: TextInputSupportedTypes.text,
    label: 'Identifier',
    disabled: true,
    required: true,
    width: '2'
  },
  ...commonAddAndEditFields
]

export const sectionElesForEditingBasic: Array<FormFieldsModel<ISectionCustomFieldProperties>> = [
  ...labelsForBasicAndAdvanced(8, 6),
  componentSelectorForBasicAndAdvanced(4),
  ...inputTypeSelectors,
  {
    componentCode: FORM_COMPONENTS_CODES.hiddenInput,
    fieldName: 'fieldName'
  },
  ...commonAddAndEditFields
]
