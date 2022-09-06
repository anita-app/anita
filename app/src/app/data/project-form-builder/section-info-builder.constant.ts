import { RESERVED_FIELDS } from 'app/models/reserved-fields.constant'
import { FormFieldsModel } from 'app/components-no/shared-components/forms-automator/form-automator.types'
import { FORM_COMPONENTS_CODES } from 'app/components-no/shared-components/forms-automator/form-component-codes.enum'
import { TextInputSupportedTypes } from 'app/components-no/shared-components/forms-automator/input-supported-types.const'
import { Icons } from 'app/libs/icons/icons.class'
import { SectionDetailsDeclaration } from 'app/models/section/section.declarations'

export const sectionDetailsFormFieldsModel: Array<FormFieldsModel<SectionDetailsDeclaration>> = [
  {
    componentCode: FORM_COMPONENTS_CODES.hiddenInput,
    fieldName: RESERVED_FIELDS.id
  },
  {
    componentCode: FORM_COMPONENTS_CODES.basicInput,
    fieldName: 'title',
    type: TextInputSupportedTypes.text,
    label: 'Title',
    required: true,
    width: '9'
  },
  {
    componentCode: FORM_COMPONENTS_CODES.basicSelect,
    fieldName: 'icon',
    label: 'Icon',
    options: Icons.getIconsOptionsList(),
    required: false,
    width: '3'
  },
  {
    componentCode: FORM_COMPONENTS_CODES.childOfSelectorForSection,
    fieldName: 'childOf',
    label: 'Parent sections:',
    options: []
  }
]
