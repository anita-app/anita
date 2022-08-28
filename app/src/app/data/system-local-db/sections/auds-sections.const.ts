import { RESERVED_AUDS_KEYS, ISection } from 'app/data/project-structure/project-info'
import { SectionDefinition } from 'app/libs/db-connector/db-builder/sez-definition'

/**
 * Defines the table _sections and its fields for system data of the AnitaUniversalDataStorage structure.
 * This is needed to work on system sections with DbConnector.
 */
export const auds_sections: SectionDefinition<ISection> = {
  name: RESERVED_AUDS_KEYS._sections,
  pk: 'id',
  fields: ['title'],
  jsonFields: ['childOf', 'formModel']
}
