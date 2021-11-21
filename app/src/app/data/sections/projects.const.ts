import { RESERVED_FIELDS } from 'app/data/form-models/system-fields-for-sections.constant';
import { LocalProjectSettings } from 'app/data/model/project-info';
import { SectionDefinition } from 'app/libs/db-connector/db-builder/sez-definition';

/**
 * Defines the table projects and its fields for the `indexedDb` plugin of `db-connector`.
 * In the table `projects` are stored only the essential information needed to load the project from its data source.
 */
export const projects: SectionDefinition<LocalProjectSettings> = {
  name: 'projects',
  fields: [
    'title',
    'fileHandle',
    'description',
    RESERVED_FIELDS.dateCreation
  ]
};
