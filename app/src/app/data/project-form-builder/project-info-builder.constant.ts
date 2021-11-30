import { LOCAL_STORAGE_SYSTEMS } from 'app/data/local-dbs/local-storage-systems.enum';
import { ProjectSettings } from 'app/data/project-structure/project-info';
import { RESERVED_FIELDS } from 'app/data/project-structure/reserved-fields.constant';
import { FormFieldsModel } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types';
import { FORM_COMPONENTS_CODES } from 'app/ui-react-components/shared-components/forms-automator/form-component-codes.enum';


const hintFileSystem = 'The Project is saved in a file on your computer in JSON. Data is updated automatically every time you make any change.\nYou can chose the name and the location of the file when you click "Save" at the bottom of this form.';
const hintFsNotSupported = 'Not supported in this browser.\nAvailable only on the Desktop version of Chrome, Edge and Opera.';
const indexedDB = 'The Project is saved on your computer in the IndexedDB database of your Browser.\nYou can export data in a JSON file at any time.';
const sqLite = 'The Project is saved on your computer in a SQLite database.\nThe database is stored in a file in your File System.';

const commonFieldsForProjectInfo: Array<FormFieldsModel<ProjectSettings>> = [{
  componentCode: FORM_COMPONENTS_CODES.hiddenInput,
  fieldName: RESERVED_FIELDS.id
},
{
  componentCode: FORM_COMPONENTS_CODES.hiddenInput,
  fieldName: RESERVED_FIELDS.createdAt
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
}];

const availableSystems = [
  {
    label: 'File system',
    value: LOCAL_STORAGE_SYSTEMS.fileSystem,
    disabled: typeof window['showOpenFilePicker'] === 'undefined',
    hint: typeof window['showOpenFilePicker'] === 'function' ? hintFileSystem : hintFsNotSupported
  },
  {
    label: 'Local database (IndexedDB)',
    value: LOCAL_STORAGE_SYSTEMS.IndexedDB,
    hint: indexedDB
  },
  {
    label: 'Local database (SQLite)',
    value: LOCAL_STORAGE_SYSTEMS.SQLite,
    disabled: typeof window['showOpenFilePicker'] === 'undefined',
    hint: typeof window['showOpenFilePicker'] === 'function' ? sqLite : hintFsNotSupported
  }
]

/**
 * Defines the Form model to set the field properties of `ProjectSettings`.
 * Empty project template used when creating new projects.
 */
export const projectInfoNewItem: Array<FormFieldsModel<ProjectSettings>> = [
  ...commonFieldsForProjectInfo,
  {
    componentCode: FORM_COMPONENTS_CODES.basicRadio,
    fieldName: 'localStorage',
    value: LOCAL_STORAGE_SYSTEMS.IndexedDB,
    label: 'Local storage',
    required: true,
    options: availableSystems
  }
];

export const projectInfoForEditing: Array<FormFieldsModel<ProjectSettings>> = [
  ...commonFieldsForProjectInfo,
  {
    componentCode: FORM_COMPONENTS_CODES.basicRadio,
    fieldName: 'localStorage',
    value: LOCAL_STORAGE_SYSTEMS.IndexedDB,
    label: 'Local storage',
    required: true,
    disabled: true,
    options: availableSystems
  }
];
