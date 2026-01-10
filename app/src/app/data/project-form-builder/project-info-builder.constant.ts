import { LOCAL_STORAGE_SYSTEMS } from 'app/data/local-dbs/local-storage-systems.enum'
import { RESERVED_FIELDS } from 'app/models/reserved-fields.constant'
import { FORM_COMPONENTS_CODES } from 'app/components/shared-components/forms-automator/form-component-codes.enum'
import { TextInputSupportedTypes } from 'app/components/shared-components/forms-automator/input-supported-types.const'
import type { FormFieldsModel, IOptionKeysModel } from 'app/components/shared-components/forms-automator/form-automator.types'
import type { IProjectSettings } from 'app/models/project/project.declarations'

const indexedDB = 'The Project is saved on your computer in the IndexedDB database of your Browser.\nYou can export data in a JSON file at any time.'

const commonFieldsForProjectInfo: Array<FormFieldsModel<IProjectSettings>> = [{
  componentCode: FORM_COMPONENTS_CODES.hiddenInput,
  fieldName: RESERVED_FIELDS.id,
},
{
  componentCode: FORM_COMPONENTS_CODES.hiddenInput,
  fieldName: RESERVED_FIELDS.createdAt,
},
{
  componentCode: FORM_COMPONENTS_CODES.basicInput,
  fieldName: 'title',
  type: TextInputSupportedTypes.text,
  value: '',
  label: 'Project',
  required: true,
},
{
  componentCode: FORM_COMPONENTS_CODES.basicTextarea,
  fieldName: 'description',
  value: '',
  label: 'Description',
  required: true,
}]

export const availableSystems: Array<IOptionKeysModel> = [
  {
    label: 'Internal database (IndexedDB)',
    value: LOCAL_STORAGE_SYSTEMS.IndexedDB,
    hint: indexedDB,
  },
]

/**
 * Defines the Form model to set the field properties of `ProjectSettings`.
 * Empty project template used when creating new projects.
 */
export const projectInfoNewItem: Array<FormFieldsModel<IProjectSettings>> = [
  ...commonFieldsForProjectInfo,
  {
    componentCode: FORM_COMPONENTS_CODES.remoteSelector,
    fieldName: 'remoteStorage',
    value: LOCAL_STORAGE_SYSTEMS.IndexedDB,
    label: 'Remote storage',
    required: false,
    options: [], // to be filled by the component itself with the available remote storage options
  },
]

export const projectInfoForEditing: Array<FormFieldsModel<IProjectSettings>> = [
  ...commonFieldsForProjectInfo,
]
