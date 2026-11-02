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
  labelHint: 'Where the project is kept besides this browser: Dropbox, a WordPress site or a file on this computer.',
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
 * @options "Remote storage": none (only this browser), Dropbox, a connected WordPress site or a file on this computer.
 * Its hint only names the choices; a box under the field explains how the chosen one works (where the project is
 * saved, which devices get it, who can see it, and for a file that the browser asks permission at each visit).
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
