import { LOCAL_STORAGE_SYSTEMS } from 'app/data/local-dbs/local-storage-systems.enum'
import { RESERVED_FIELDS } from 'app/data/project-structure/reserved-fields.constant'
import { AbstractModel } from 'app/libs/db-connector/models/abstract-model'
import { FileSystemFileHandle } from 'app/libs/db-connector/plugins/file-handles/helpers/file-system-access-api'
import { FormFieldsModel, IOptionKeysModel, TSupportedFormsTypes } from 'app/components/shared-components/forms-automator/form-automator.types'
import { FORM_COMPONENTS_CODES } from 'app/components/shared-components/forms-automator/form-component-codes.enum'
import { TextInputSupportedTypes } from 'app/components/shared-components/forms-automator/input-supported-types.const'
import { TIconName } from 'app/libs/Icons/Icons.class'

/**
 * Reserved keys are needed to store system required properties.
 *
 * @remarks
 * Users can still pick any of these as section names as sections are stored using their system-generated `id` as key.
 */
export enum RESERVED_AUDS_KEYS {
  _settings = '_settings',
  _sections = '_sections'
}

/**
 * Data structure of Anita, composed of both SystemData and UserData.
 */
export type AnitaUniversalDataStorage = SystemData & UserData;

/**
 * Store for system required properties. Includes general settings and Sections declarations. The reserved keys define system required properties.
 */
export type SystemData = {
  [RESERVED_AUDS_KEYS._settings]: Array<IProjectSettings>;
  [RESERVED_AUDS_KEYS._sections]: Array<ISection>;
};

/**
 * Sections' data, stored in a Object, where the key is the section `id` and the value is a `Array<SectionElement>`.
 */
export type UserData = {
  [sectionId: string]: Array<SectionElement>;
};

/**
 * Defines the structure of the general information on a project.
 */
export interface IProjectSettings {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  localStorage: LOCAL_STORAGE_SYSTEMS;
  updatedAt?: string;
  encrypted?: boolean;
}

export interface AdditionalInfoForLocalStorage {
  fileHandle?: FileSystemFileHandle;
  dexieInfoForUpgrade?: {
    previousVersions: Array<Array<string>>;
    DS: AbstractModel;
  }
}

/**
 * Info on Projects saved locally to know what project are on the device.
 *
 * @property [fileHandle] - The file handle of the project file (only if the project is saved on the file system)
 * @property [sections] - The sections of the project to load the IndexedDB database with Dexie
 */
export interface LocalProjectSettings extends IProjectSettings, AdditionalInfoForLocalStorage {
}

/**
 * Defines the properties of user defined fields of a `Section`
 *
 * @remarks
 * These fields are for the object to be stored in `sections.formModel[]` of the `AnitaUniversalDataStorage` store.
 */
export interface ISectionCustomFieldProperties {
  componentCode: FORM_COMPONENTS_CODES;
  type?: TextInputSupportedTypes;
  fieldName: string;
  label?: string;
  options?: Array<IOptionKeysModel>;
  required?: boolean;
  externalLabel?: boolean;
  value?: any;
  width?: number;
  [RESERVED_FIELDS.id]?: never;
  [RESERVED_FIELDS.createdAt]?: never;
}

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
  formModel: Array<FormFieldsModel<TSupportedFormsTypes>>;
}

/**
 * Defines the properties of each parent to which a element is connected.
 */
export interface ParentInfoForDetailsView {
  txt: string;
  sectionId: string;
  element: SectionElement;
}

/**
 * Defines the bare minimum fields of an `Element` of a `Section`.
 */
export interface SectionElement {
  [RESERVED_FIELDS.id]?: string;
  [RESERVED_FIELDS.createdAt]?: string;
  [RESERVED_FIELDS.createdBy]?: string;
  [RESERVED_FIELDS.parentsInfo]?: Array<string>;
  [RESERVED_FIELDS.updatedAt]?: string;
  [key: string]: any;
}
