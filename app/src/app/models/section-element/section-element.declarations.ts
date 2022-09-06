import { RESERVED_FIELDS } from 'app/models/reserved-fields.constant'

/**
 * Defines the bare minimum fields of an `Element` of a `Section`.
 */
export interface ISectionElement {
  [RESERVED_FIELDS.id]?: string;
  [RESERVED_FIELDS.createdAt]?: string;
  [RESERVED_FIELDS.createdBy]?: string;
  [RESERVED_FIELDS.parentsInfo]?: Array<string>;
  [RESERVED_FIELDS.updatedAt]?: string;
  [key: string]: any;
}
