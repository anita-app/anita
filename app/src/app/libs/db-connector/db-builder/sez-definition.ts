/**
 * Section name
 */
export type SectionName = string;

/**
 * Contains the minimum information needed to build a SectionModel.
 */
export interface SectionDefinition<T> {
  name: SectionName;
  pk?: keyof T & string;
  fields?: Array<keyof T>;
  indexes?: Array<keyof T>;
  orderBy?: keyof T & string;
  ownerIdentifier?: keyof T & string;
  childOf?: Array<SectionName>;
  parentsIdentifiers?: keyof T;
}

/**
 * Defines the information on a section needed to perform queries.
 */
export interface SectionModel<T> extends SectionDefinition<T> {
  name: SectionName;
  pk: keyof T & string;
  fields: Array<keyof T>;
  indexes: Array<keyof T>;
  orderBy: keyof T & string;
  ownerIdentifier: keyof T & string;
}
