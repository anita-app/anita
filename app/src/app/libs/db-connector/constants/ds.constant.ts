import { SectionModel } from '@anita/client/libs/db-connector/db-builder/sez-definition';

/**
 * Abstracrt interface of the sections of the data structure of the DB.
 */
export interface AbstractModel {
  [key: string]: SectionModel<any>;
}
