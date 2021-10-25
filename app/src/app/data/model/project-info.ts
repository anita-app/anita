import { RESERVED_FIELDS } from '@anita/client/data/form-models/system-fields-for-sections.constant';
import { FORM_COMPONENTS_CODES, OptionKeysModel } from '@anita/client/data/model/form-model-commons';
import { FileSystemFileHandle } from '@anita/client/libs/db-connector/plugins/file-handles/helpers/file-system-access-api';

/**
 * Reserved keys are needed to store system required properties.
 *
 * @remarks
 * Users can still pick any of these as section names as sections are stored using their system-generated `id` as key.
 */
export enum RESERVED_UDS_KEYS {
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
  [RESERVED_UDS_KEYS._settings]: Array<ProjectSettings>;
  [RESERVED_UDS_KEYS._sections]: Array<Section>;
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
export interface ProjectSettings {
  id: string;
  title: string;
  description: string;
  dateCreation: string;
  encrypted?: boolean;
}

/**
 * Info on Projects saved in IndexedDB to know what project are on the device.
 */
export interface LocalProjectSettings extends ProjectSettings {
  fileHandle?: FileSystemFileHandle;
}

/**
 * Defines the properties of the system fields of a `Section`.
 *
 * @remarks
 * These fields are for the object to be stored in `sections.formModel[]` of the `AnitaUniversalDataStorage` store.
 */
export interface SectionSystemFieldsProperties {
  componentCode: FORM_COMPONENTS_CODES;
  fieldName: string;
}

/**
 * Defines the properties of user defined fields of a `Section`
 *
 * @remarks
 * These fields are for the object to be stored in `sections.formModel[]` of the `AnitaUniversalDataStorage` store.
 */
export interface SectionCustomFieldProperties extends SectionSystemFieldsProperties {
  label: string;
  options?: Array<OptionKeysModel>;
  required?: boolean;
  externalLabel?: boolean;
  validators?: {
    required?: boolean;
    requiredTrue?: boolean;
    minLength?: number;
    email?: boolean;
  };
  value?: any;
}

/**
 * Defines the bare minimum properties of a `Section` of a Project.
 */
export interface SectionDetailsDeclaration {
  id: string;
  title: string;
  childOf?: Array<string>;
}

/**
 * Defines the full properties of a Section.
 */
export interface Section extends SectionDetailsDeclaration {
  formModel: Array<SectionSystemFieldsProperties | SectionCustomFieldProperties>;
}

/**
 * Defines the bare minimum fields of an `Element` of a `Section`.
 */
export interface SectionElement {
  [RESERVED_FIELDS.id]: string;
  [RESERVED_FIELDS.dateCreation]: string;
  [RESERVED_FIELDS.createdBy]?: string;
  [RESERVED_FIELDS.parentsInfo]?: string;
  [RESERVED_FIELDS.lastModified]?: string;
  [key: string]: any;
}
