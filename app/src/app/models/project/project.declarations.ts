import type { TAccessLevel } from 'app/libs/cloud-sync/wordpress/wordpress.const'
import type { LOCAL_STORAGE_SYSTEMS } from 'app/data/local-dbs/local-storage-systems.enum'
import type { AbstractModel } from 'app/libs/db-connector/models/abstract-model'
import type { ISection } from 'app/models/section/section.declarations'
import type { ISectionElement } from 'app/models/section-element/section-element.declarations'
import type { RESERVED_FIELDS } from 'app/models/reserved-fields.constant'

/**
 * Reserved keys are needed to store system required properties.
 *
 * @remarks
 * Users can still pick any of these as section names as sections are stored using their system-generated `id` as key.
 */
export enum RESERVED_AUDS_KEYS {
  _settings = '_settings',
  _sections = '_sections',
}

/**
 * Data structure of Anita, composed of both SystemData and UserData.
 */
export type TAnitaUniversalDataStorage = TSystemData & UserData;

/**
 * Store for system required properties. Includes general settings and Sections declarations. The reserved keys define system required properties.
 */
export interface TSystemData {
  [RESERVED_AUDS_KEYS._settings]: Array<IProjectSettings>
  [RESERVED_AUDS_KEYS._sections]: Array<ISection>
}

/**
 * Sections' data, stored in a Object, where the key is the section `id` and the value is a `Array<SectionElement>`.
 */
export interface UserData {
  [sectionId: string]: Array<ISectionElement>
}

/**
 * Defines the structure of the general information on a project.
 */
export interface IProjectSettings {
  id: string
  title: string
  description: string
  [RESERVED_FIELDS.createdAt]: string
  [RESERVED_FIELDS.updatedAt]?: string
  localStorage?: LOCAL_STORAGE_SYSTEMS
  /**
   * Where the project is synced besides this device, if anywhere: the id of a WordPress site (its address without
   * protocol), or DROPBOX_REMOTE_ID for Dropbox.
   */
  remoteStorage?: string
  /**
   * Who can see the project on the WordPress site: 'private' (only the owner) or the minimum WordPress role.
   */
  remoteAccessLevel?: TAccessLevel
  /**
   * Dropbox folder where the file of the project is created, when it is not the default one.
   * Kept only until the project is saved in Dropbox.
   */
  dropboxFolder?: string
  encrypted?: boolean
}

export interface AdditionalInfoForLocalStorage {
  dexieInfoForUpgrade?: {
    previousVersions: Array<Array<string>>
    DS: AbstractModel
  }
}

/**
 * Info on Projects saved locally to know what project are on the device.
 *
 * @property [sections] - The sections of the project to load the IndexedDB database with Dexie
 */
export interface LocalProjectSettings extends IProjectSettings, AdditionalInfoForLocalStorage {
}
