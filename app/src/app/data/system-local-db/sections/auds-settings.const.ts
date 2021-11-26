import { ProjectSettings, RESERVED_AUDS_KEYS } from 'app/data/project-structure/project-info';
import { SectionDefinition } from 'app/libs/db-connector/db-builder/sez-definition';

/**
 * Defines the table _settings and its fields for system data of the AnitaUniversalDataStorage structure.
 * This is needed to work on system sections with DbConnector.
 */
export const auds_settings: SectionDefinition<ProjectSettings> = {
  name: RESERVED_AUDS_KEYS._settings,
  pk: 'id',
  fields: ['title', 'dateCreation', 'description']
};
