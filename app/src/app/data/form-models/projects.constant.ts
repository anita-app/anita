import { RESERVED_FIELDS } from '@anita/client/data/form-models/system-fields-for-sections.constant';
import { FORM_COMPONENTS_CODES } from '@anita/client/data/model/form-model-commons';
import { ProjectSettings } from '@anita/client/data/model/project-info';
import { FormFieldsModel } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';

/**
 * Defines the Form model to set the field properties of `ProjectSettings`.
 * Empty project template used when creating new projects.
 */
export const projects: Array<Array<FormFieldsModel<ProjectSettings>>> = [
  [
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
      validators: {
        required: true
      }
    },
    {
      componentCode: FORM_COMPONENTS_CODES.basicTextarea,
      fieldName: 'description',
      value: '',
      label: 'Description',
      validators: {
        required: true
      }
    }
  ]
];
