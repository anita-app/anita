import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { ISection } from 'app/models/section/section.declarations'
import { SectionDefinition } from 'app/libs/db-connector/db-builder/sez-definition'
import { RESERVED_FIELDS } from 'app/models/reserved-fields.constant'

/**
 * Defines the table _sections and its fields for system data of the AnitaUniversalDataStorage structure.
 * This is needed to work on system sections with DbConnector.
 */
export const audsSections: SectionDefinition<ISection> = {
  name: RESERVED_AUDS_KEYS._sections,
  pk: 'id',
  fields: ['title', 'title_short', 'icon', RESERVED_FIELDS.createdAt, RESERVED_FIELDS.updatedAt],
  jsonFields: ['childOf', 'formModel', 'viewSettings']
}
