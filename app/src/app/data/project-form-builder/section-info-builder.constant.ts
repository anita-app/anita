import { FORM_COMPONENTS_CODES } from 'app/data/model/form-model-commons';
import { SectionDetailsDeclaration } from 'app/data/model/project-info';
import { RESERVED_FIELDS } from 'app/data/model/reserved-fields.constant';
import { FormFieldsModel } from 'app/ui-react-components/shared-components/forms-automator/form-fields/form-fields-model';

export const sectionDetailsFormFieldsModel: Array<FormFieldsModel<SectionDetailsDeclaration>> = [
  {
    componentCode: FORM_COMPONENTS_CODES.hiddenInput,
    fieldName: RESERVED_FIELDS.id
  },
  {
    componentCode: FORM_COMPONENTS_CODES.basicInput,
    fieldName: 'title',
    type: 'text',
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
