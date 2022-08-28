import { SectionDetailsDeclaration } from 'app/data/project-structure/project-info'
import { RESERVED_FIELDS } from 'app/data/project-structure/reserved-fields.constant'
import { FormFieldsModel } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types'
import { FORM_COMPONENTS_CODES } from 'app/ui-react-components/shared-components/forms-automator/form-component-codes.enum'
import { TextInputSupportedTypes } from 'app/ui-react-components/shared-components/forms-automator/input-supported-types.const'

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
