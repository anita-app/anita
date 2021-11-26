import { FORM_COMPONENTS_CODES } from 'app/data/model/form-model-commons';
import { ProjectSettings } from 'app/data/model/project-info';
import { RESERVED_FIELDS } from 'app/data/model/reserved-fields.constant';
import { FormFieldsModel } from 'app/ui-react-components/shared-components/forms-automator/form-fields/form-fields-model';

/**
 * Defines the Form model to set the field properties of `ProjectSettings`.
 * Empty project template used when creating new projects.
 */
export const projectFormFieldsModel: Array<FormFieldsModel<ProjectSettings>> = [
  {
    componentCode: FORM_COMPONENTS_CODES.hiddenInput,
    fieldName: RESERVED_FIELDS.id
  },
  {
    componentCode: FORM_COMPONENTS_CODES.hiddenInput,
    fieldName: RESERVED_FIELDS.dateCreation
  },
  {
    componentCode: FORM_COMPONENTS_CODES.basicInput,
    fieldName: 'title',
    type: 'text',
    value: '',
    label: 'Project',
    required: true
  },
  {
    componentCode: FORM_COMPONENTS_CODES.basicTextarea,
    fieldName: 'description',
    value: '',
    label: 'Description',
    required: true
  }
];
