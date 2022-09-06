import { IProjectSettings, RESERVED_AUDS_KEYS } from 'app/models/project-n/project.declarations'
import { SectionDefinition } from 'app/libs/db-connector/db-builder/sez-definition'

/**
 * Defines the table _settings and its fields for system data of the AnitaUniversalDataStorage structure.
 * This is needed to work on system sections with DbConnector.
 */
export const audsSettings: SectionDefinition<IProjectSettings> = {
  name: RESERVED_AUDS_KEYS._settings,
  pk: 'id',
  fields: ['title', 'localStorage', 'createdAt', 'description']
}
