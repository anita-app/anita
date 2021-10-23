import { RESERVED_FIELDS } from '@anita/client/data/form-models/system-fields-for-sections.constant';
import { LocalProjectSettings } from '@anita/client/data/model/project-info';
import { SectionDefinition } from '@anita/client/libs/db-connector/db-builder/sez-definition';

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
