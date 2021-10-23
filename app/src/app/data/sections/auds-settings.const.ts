import { ProjectSettings, RESERVED_UDS_KEYS } from '@anita/client/data/model/project-info';
import { SectionDefinition } from '@anita/client/libs/db-connector/db-builder/sez-definition';

/**
 * Defines the table _settings and its fields for system data of the AnitaUniversalDataStorage structure.
 * This is needed to work on system sections with DbConnector.
 */
export const auds_settings: SectionDefinition<ProjectSettings> = {
  name: RESERVED_UDS_KEYS._settings,
  pk: 'id',
  fields: ['title', 'dateCreation', 'description']
};
