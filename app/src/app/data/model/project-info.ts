import { FORM_COMPONENTS_CODES, OptionKeysModel } from 'app/data/model/form-model-commons';
import { RESERVED_FIELDS } from 'app/data/model/reserved-fields.constant';
import { FileSystemFileHandle } from 'app/libs/db-connector/plugins/file-handles/helpers/file-system-access-api';
import { FormFieldsModel, SupportedFormsTypes } from 'app/ui-react-components/shared-components/forms-automator/form-fields/form-fields-model';

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
  lastModified?: string;
  encrypted?: boolean;
}

/**
 * Info on Projects saved in IndexedDB to know what project are on the device.
 */
export interface LocalProjectSettings extends ProjectSettings {
  fileHandle?: FileSystemFileHandle;
}

/**
 * Defines the properties of user defined fields of a `Section`
 *
 * @remarks
 * These fields are for the object to be stored in `sections.formModel[]` of the `AnitaUniversalDataStorage` store.
 */
export interface SectionCustomFieldProperties {
  componentCode: FORM_COMPONENTS_CODES;
  fieldName: string;
  label?: string;
  options?: Array<OptionKeysModel>;
  required?: boolean;
  externalLabel?: boolean;
  value?: any;
  width?: number;
  [RESERVED_FIELDS.id]?: never;
  [RESERVED_FIELDS.dateCreation]?: never;
}

/**
 * Defines the bare minimum properties of a `Section` of a Project.
 */
export interface SectionDetailsDeclaration {
  id: string;
  title: string;
  childOf?: Array<string>;
  [RESERVED_FIELDS.dateCreation]?: never;
}

/**
 * Defines the full properties of a Section.
 */
export interface Section extends SectionDetailsDeclaration {
  formModel: Array<FormFieldsModel<SupportedFormsTypes>>;
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
  [RESERVED_FIELDS.dateCreation]?: string;
  [RESERVED_FIELDS.createdBy]?: string;
  [RESERVED_FIELDS.parentsInfo]?: Array<string>;
  [RESERVED_FIELDS.lastModified]?: string;
  [key: string]: any;
}
