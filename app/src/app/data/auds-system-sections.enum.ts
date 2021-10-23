import { auds_sections } from '@anita/client/data/sections/auds-sections.const';
import { auds_settings } from '@anita/client/data/sections/auds-settings.const';

/**
 * Identifies the table on which run the query with `db-connector`.
 */
export const enum AUDS_SYSTEM_SECTIONS {
  auds_settings = 1,
  auds_sections
}

/**
 * Array to be passed to `db-connector` to initialize the DB with Dexie, via the IndexedDb plugin.
 */
export const AUDS_SYSTEM_SECTIONS_DEFINITIONS = [auds_settings, auds_sections];
