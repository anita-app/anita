import { RESERVED_FIELDS } from 'app/models/reserved-fields.constant'
import { FormFieldsModel, TSupportedFormsTypes, IOptionKeysModel } from 'app/components-no/shared-components/forms-automator/form-automator.types'
import { TIconName } from 'app/libs/icons/icons.class'
import { SupportedViews } from 'app/models/section/view-settings.const'
import { TextInputSupportedTypes } from 'app/components-no/shared-components/forms-automator/input-supported-types.const'
import { FORM_COMPONENTS_CODES } from 'app/components-no/shared-components/forms-automator/form-component-codes.enum'

/**
 * Defines the bare minimum properties of a `Section` of a Project.
 */
export interface SectionDetailsDeclaration {
  id: string
  title: string
  icon?: TIconName
  childOf?: Array<string>
  [RESERVED_FIELDS.createdAt]?: never
}

/**
 * Defines the full properties of a Section.
 */
export interface ISection extends SectionDetailsDeclaration {
  formModel: Array<FormFieldsModel<TSupportedFormsTypes>>
  viewSettings?: ISectionViewSettings
}

export interface ISectionViewSettings {
  preferredView?: SupportedViews
}

/**
 * Defines the properties of user defined fields of a `Section`
 *
 * @remarks
 * These fields are for the object to be stored in `sections.formModel[]` of the `AnitaUniversalDataStorage` store.
 */
export interface ISectionCustomFieldProperties {
  componentCode: FORM_COMPONENTS_CODES
  type?: TextInputSupportedTypes
  fieldName: string
  label?: string
  options?: Array<IOptionKeysModel>
  required?: boolean
  externalLabel?: boolean
  value?: any
  width?: number
  [RESERVED_FIELDS.id]?: never
  [RESERVED_FIELDS.createdAt]?: never
}
