import { SectionCustomFieldProperties, SectionDetailsDeclaration } from 'app/data/project-structure/project-info'
import { RESERVED_FIELDS } from 'app/data/project-structure/reserved-fields.constant'
import { FormFieldsModel } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types'
import { FORM_COMPONENTS_CODES, SELECTABLE_FORM_ELES } from 'app/ui-react-components/shared-components/forms-automator/form-component-codes.enum'
import { INPUT_SUPPORTED_TYPES_OPTIONS, InputSupportedTypes } from 'app/ui-react-components/shared-components/forms-automator/input-supported-types.const'

export const sectionDetailsFormFieldsModel: Array<FormFieldsModel<SectionDetailsDeclaration>> = [
  {
    componentCode: FORM_COMPONENTS_CODES.hiddenInput,
    fieldName: RESERVED_FIELDS.id
  },
  {
    componentCode: FORM_COMPONENTS_CODES.basicInput,
    fieldName: 'title',
    type: InputSupportedTypes.text,
    label: 'Section name',
    required: true
  },
  {
    componentCode: FORM_COMPONENTS_CODES.childOfSelectorForSection,
    fieldName: 'childOf',
    label: 'Parent sections:',
    options: []
  }
];

const allFieldsExceptBasicInput = Object.entries(FORM_COMPONENTS_CODES).map(([key, value]) => value).filter(value => value !== FORM_COMPONENTS_CODES.basicInput && typeof value === 'number')

const labelsForBasicAndAdvanced = (sizeWithoutInputType: number, sizeWithtInputType: number): Array<FormFieldsModel<SectionCustomFieldProperties>> => [
  {
    componentCode: FORM_COMPONENTS_CODES.basicInput,
    fieldName: 'label',
    type: InputSupportedTypes.text,
    label: 'Field label',
    required: true,
    width: sizeWithoutInputType.toString(),
    prerequisites: [{
      componentCode: [undefined, "", ...allFieldsExceptBasicInput],
    }]
  },
  {
    componentCode: FORM_COMPONENTS_CODES.basicInput,
    fieldName: 'label',
    type: InputSupportedTypes.text,
    label: 'Field label',
    required: true,
    width: sizeWithtInputType.toString(),
    prerequisites: [{ componentCode: [FORM_COMPONENTS_CODES.basicInput] }]

  },
]

const componentSelectorForBasicAndAdvanced = (size: number): FormFieldsModel<SectionCustomFieldProperties> => ({
  componentCode: FORM_COMPONENTS_CODES.basicSelect,
  fieldName: 'componentCode',
  options: SELECTABLE_FORM_ELES,
  value: 1,
  label: 'Data type',
  required: true,
  width: size.toString()
})

/**
 * Shows the select options for the type of Input element
 */
const inputTypeSelector: FormFieldsModel<SectionCustomFieldProperties> = {
  componentCode: FORM_COMPONENTS_CODES.basicSelect,
  fieldName: 'type',
  options: INPUT_SUPPORTED_TYPES_OPTIONS,
  value: InputSupportedTypes.text,
  label: 'Content type',
  required: false,
  width: "2",
  prerequisites: [{ componentCode: [FORM_COMPONENTS_CODES.basicInput] }]
}

/**
 * Defines common fields that are used both when creating and editing fields of a `Section`.
 */
const commonAddAndEditFields: Array<FormFieldsModel<SectionCustomFieldProperties>> = [
  {
    componentCode: FORM_COMPONENTS_CODES.optionsMaker,
    fieldName: 'options',
    type: InputSupportedTypes.text,
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
];

/**
 * Defines the Form model to set the field properties of a `Section`.
 * All the values specified in each field of `sectionElesNewItemAdvanced` are necessary for creating each field.
 *
 * @remarks
 * For new fields only. Existing items must use `sectionElesForEditingAdvanced` as some properties can't be changed after the filed has been created.
 */
export const sectionElesNewItemAdvanced: Array<FormFieldsModel<SectionCustomFieldProperties>> = [
  ...labelsForBasicAndAdvanced(7, 5),
  componentSelectorForBasicAndAdvanced(3),
  inputTypeSelector,
  {
    componentCode: FORM_COMPONENTS_CODES.basicInput,
    fieldName: 'fieldName',
    type: InputSupportedTypes.text,
    label: 'Identifier',
    required: true,
    width: "2"
  },
  ...commonAddAndEditFields
];

export const sectionElesNewItemBasic: Array<FormFieldsModel<SectionCustomFieldProperties>> = [
  ...labelsForBasicAndAdvanced(8, 6),
  componentSelectorForBasicAndAdvanced(4),
  inputTypeSelector,
  {
    componentCode: FORM_COMPONENTS_CODES.hiddenInput,
    fieldName: 'fieldName'
  },
  ...commonAddAndEditFields
];

/**
 * Defines the Form model to edit the properties of an existing field of a `Section`.
 *
 * @remarks
 * For existing fields only, some properties can't be changed after the filed has been created. New items must use `sectionElesNewItemAdvanced` instead.
 */
export const sectionElesForEditingAdvanced: Array<FormFieldsModel<SectionCustomFieldProperties>> = [
  ...labelsForBasicAndAdvanced(7, 5),
  componentSelectorForBasicAndAdvanced(3),
  inputTypeSelector,
  {
    componentCode: FORM_COMPONENTS_CODES.basicInput,
    fieldName: 'fieldName',
    type: InputSupportedTypes.text,
    label: 'Identifier',
    disabled: true,
    required: true,
    width: "2"
  },
  ...commonAddAndEditFields
];

export const sectionElesForEditingBasic: Array<FormFieldsModel<SectionCustomFieldProperties>> = [
  ...labelsForBasicAndAdvanced(8, 6),
  componentSelectorForBasicAndAdvanced(4),
  inputTypeSelector,
  {
    componentCode: FORM_COMPONENTS_CODES.hiddenInput,
    fieldName: 'fieldName'
  },
  ...commonAddAndEditFields
];
