import { SectionDefinition } from 'app/libs/db-connector/db-builder/sez-definition'

/**
 * Defines the table localSettings and its fields for the `indexedDb` plugin of `db-connector`
 */
export const localSettings: SectionDefinition<LocalSettingsData<LOCAL_SETTINGS_KEYS>> = {
  name: 'localSettings',
  fields: [
    'data'
  ]
}

/**
 * Constant to uniquely identify values of local settings.
 * As of now there are no settings yet to save, so we keep `testData`.
 */
export enum LOCAL_SETTINGS_KEYS {
  testData = 1
}

/**
 * Defines the expected data structure to be saved in `localSettings`.
 */
export interface LocalSettingsData<T extends LOCAL_SETTINGS_KEYS> {
  id: T;
  data: DataByKey[T];
}

/**
 * Identifies the data type saved in `localSettings` by the enum value of `LOCAL_SETTINGS_KEYS`.
 */
interface DataByKey {
  [LOCAL_SETTINGS_KEYS.testData]: unknown;
}

/**
 * Example of the method to store data in localSettings:
 *
 * private saveLocalSettings<T extends LOCAL_SETTINGS_KEYS>(id: T, data: DataByKey[T]): void {
 *   dbInsertor(CLIENT_SECTIONS.localSettings, { id, data }).autoInsert();
 * }
 */
