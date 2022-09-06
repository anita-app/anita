import { LOCAL_STORAGE_SYSTEMS } from 'app/data/local-dbs/local-storage-systems.enum'
import { AbstractModel } from 'app/libs/db-connector/models/abstract-model'
import { FileSystemFileHandle } from 'app/libs/db-connector/plugins/file-handles/helpers/file-system-access-api'
import { ISection } from 'app/models/section-n/section.declarations'
import { ISectionElement } from 'app/models/section-element/section-element.declarations'

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
export type TAnitaUniversalDataStorage = TSystemData & UserData;

/**
 * Store for system required properties. Includes general settings and Sections declarations. The reserved keys define system required properties.
 */
export type TSystemData = {
  [RESERVED_AUDS_KEYS._settings]: Array<IProjectSettings>
  [RESERVED_AUDS_KEYS._sections]: Array<ISection>
};

/**
 * Sections' data, stored in a Object, where the key is the section `id` and the value is a `Array<SectionElement>`.
 */
export type UserData = {
  [sectionId: string]: Array<ISectionElement>
};

/**
 * Defines the structure of the general information on a project.
 */
export interface IProjectSettings {
  id: string
  title: string
  description: string
  createdAt: string
  localStorage: LOCAL_STORAGE_SYSTEMS
  updatedAt?: string
  encrypted?: boolean
}

export interface AdditionalInfoForLocalStorage {
  fileHandle?: FileSystemFileHandle
  dexieInfoForUpgrade?: {
    previousVersions: Array<Array<string>>
    DS: AbstractModel
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
