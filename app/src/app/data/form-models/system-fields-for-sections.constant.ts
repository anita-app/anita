import { FORM_COMPONENTS_CODES } from '@anita/client/data/model/form-model-commons';
import { SectionElement } from '@anita/client/data/model/project-info';
import { FormFieldsModel } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';

/**
 * Defines the fields name that are reserved for the functioning of Anita.
 * These fields names cannot be assigned as the value of the `fieldName` of sections' fields.
 */
export enum RESERVED_FIELDS {
  id = 'id',
  dateCreation = 'dateCreation',
  parentsInfo = 'parentsInfo',
  lastModified = 'lastModified',
  createdBy = 'createdBy'
}

/**
 * Fields that must be included in each Section of a Project.
 *
 * @see SectionGenerator
 */
export const systemFieldsForSections: Array<Array<FormFieldsModel<SectionElement>>> = [
  [
    {
      componentCode: FORM_COMPONENTS_CODES.hiddenInput,
      fieldName: RESERVED_FIELDS.id
    },
    {
      componentCode: FORM_COMPONENTS_CODES.hiddenInput,
      fieldName: RESERVED_FIELDS.dateCreation
    }
  ]
];
