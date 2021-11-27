import { localSettings } from 'app/data/system-local-db/sections/local-settings.const';
import { projects } from 'app/data/system-local-db/sections/projects.const';

/**
 * Identifies the table on which run the query with `db-connector`.
 */
export const CLIENT_SECTIONS = {
  projects: projects.name,
  localSettings: localSettings.name
};

/**
 * Optional on first version, required for changes to the structure of the DB
 * Must contain on Array for each previous version
 * Each array must contain the unaltered SezDefinitions of that version
 * 
 * TODO with Dexie 3.x.x upgrading has been simplified, probably no longer needed.
 */
export const previousVersions: Array<Array<string>> = [
  // insert here previous version on DB structure change
];

/**
 * Array to be passed to `db-connector` to initialize the DB with Dexie, via the IndexedDb plugin.
 */
export const CLIENT_SEZ_DEFINITIONS = [projects, localSettings];
