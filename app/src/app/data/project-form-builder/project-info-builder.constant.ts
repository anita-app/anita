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

/** @internal */
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
const remoteStorageField: FormFieldsModel<IProjectSettings> = {
  componentCode: FORM_COMPONENTS_CODES.remoteSelector,
  fieldName: 'remoteStorage',
  value: '',
  label: 'Remote storage',
  labelHint: 'Store the project in Dropbox or on a WordPress site, to sync it across devices. On WordPress you can also share it with the users of the site.',
  required: false,
  options: [], // to be filled by the component itself with the available remote storage options
}

/**
 * @feature project.settings
 * @title Name and describe a project
 * @summary The name, description and remote storage of a project, set at the top of the project editor.
 * @where Top card of the "Add Project" / "Edit Project" editor, and the "Import project" dialog.
 * @usage 1. Type the name in "Project" and a short text in "Description".
 * 2. Optionally choose a "Remote storage".
 * 3. Save.
 * @options "Remote storage": none (only this device), Dropbox or a connected WordPress site. Its hint: store the project in
 * Dropbox or on a WordPress site to sync it across devices; on WordPress you can also share it with the users of the
 * site.
 * @rules "Project" and "Description" are required: "Save" stays disabled while they are empty. The name is shown on the project
 * card and in the app, and names the export files.
 * @errors none
 * @status stable
 * @since 0.1.0
 * @related project.create, project.edit, import.file
 */
export const projectInfoNewItem: Array<FormFieldsModel<IProjectSettings>> = [
  ...commonFieldsForProjectInfo,
  remoteStorageField,
]

/** @featurePart project.settings */
export const projectInfoForEditing: Array<FormFieldsModel<IProjectSettings>> = [
  ...commonFieldsForProjectInfo,
  remoteStorageField,
]
