import { RESERVED_FIELDS } from '@anita/client/data/form-models/system-fields-for-sections.constant';
import { FORM_COMPONENTS_CODES, SELECTABLE_FORM_ELES } from '@anita/client/data/model/form-model-commons';
import { SectionCustomFieldProperties, SectionDetailsDeclaration } from '@anita/client/data/model/project-info';
import { IdCreator } from '@anita/client/libs/id-creator/id-creator.class';
import { FormFieldsModel } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';

export const sectionDetails: Array<FormFieldsModel<SectionDetailsDeclaration>> = [
  {
    componentCode: FORM_COMPONENTS_CODES.hiddenInput,
    fieldName: RESERVED_FIELDS.id,
    value: () => IdCreator.random()
  },
  {
    componentCode: FORM_COMPONENTS_CODES.basicInput,
    fieldName: 'title',
    type: 'text',
    label: 'Section name',
    validators: {
      required: true
    }
  },
  {
    componentCode: FORM_COMPONENTS_CODES.childOfSelectorForSection,
    fieldName: 'childOf',
    label: 'Parent sections:',
    options: []
  }
];

/**
 * Defines common fields that are used both when creating and editing fields of a `Section`.
 */
const commonAddAndEditFields: Array<FormFieldsModel<SectionCustomFieldProperties>> = [
  {
    componentCode: FORM_COMPONENTS_CODES.optionsMaker,
    fieldName: 'options',
    type: 'text',
    label: 'Possible values',
    prerequisites: [{ componentCode: [FORM_COMPONENTS_CODES.basicSelect, FORM_COMPONENTS_CODES.basicRadio] }],
    validators: {
      required: true
    }
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
 * All the values specified in each field of `sectionFieldForNewItem` are necessary for creating each field.
 *
 * @remarks
 * For new fields only. Existing items must use `sectionFieldForEditing` as some properties can't be changed after the filed has been created.
 */
export const sectionFieldForNewItem: Array<FormFieldsModel<SectionCustomFieldProperties>> = [
  {
    componentCode: FORM_COMPONENTS_CODES.basicInput,
    fieldName: 'label',
    type: 'text',
    label: 'Field label',
    validators: {
      required: true
    },
    width: 'col-md-7'
  },
  {
    componentCode: FORM_COMPONENTS_CODES.basicSelect,
    fieldName: 'componentCode',
    options: SELECTABLE_FORM_ELES,
    value: 1,
    label: 'Data type',
    validators: {
      required: true
    },
    width: 'col-md-3'
  },
  {
    componentCode: FORM_COMPONENTS_CODES.basicInput,
    fieldName: 'fieldName',
    type: 'text',
    label: 'Field identifier',
    validators: {
      required: true
    },
    width: 'col-md-2'
  },
  ...commonAddAndEditFields
];

/**
 * Defines the Form model to edit the properties of an existing field of a `Section`.
 *
 * @remarks
 * For existing fields only, some properties can't be changed after the filed has been created. New items must use `sectionFieldForNewItem` instead.
 */
export const sectionFieldForEditing: Array<FormFieldsModel<SectionCustomFieldProperties>> = [
  {
    componentCode: FORM_COMPONENTS_CODES.basicInput,
    fieldName: 'label',
    type: 'text',
    label: 'Field label',
    validators: {
      required: true
    },
    width: 'col-md-7'
  },
  {
    componentCode: FORM_COMPONENTS_CODES.basicSelect,
    fieldName: 'componentCode',
    options: SELECTABLE_FORM_ELES,
    value: 1,
    label: 'Data type',
    validators: {
      required: true
    },
    width: 'col-md-3'
  },
  {
    componentCode: FORM_COMPONENTS_CODES.basicInput,
    fieldName: 'fieldName',
    type: 'text',
    label: 'Field identifier',
    readonly: true,
    validators: {
      required: true
    },
    width: 'col-md-2'
  },
  ...commonAddAndEditFields
];
