import { RESERVED_UDS_KEYS, Section } from 'app/data/model/project-info';
import { SectionDefinition } from 'app/libs/db-connector/db-builder/sez-definition';

/**
 * Defines the table _sections and its fields for system data of the AnitaUniversalDataStorage structure.
 * This is needed to work on system sections with DbConnector.
 */
export const auds_sections: SectionDefinition<Section> = {
  name: RESERVED_UDS_KEYS._sections,
  pk: 'id',
  fields: ['title', 'childOf', 'formModel']
};
