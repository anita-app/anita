/**
 * Defines the fields name that are reserved for the functioning of Anita.
 * These fields names cannot be assigned as the value of the `fieldName` of sections' fields.
 */
export enum RESERVED_FIELDS {
  id = 'id',
  dateCreation = 'dateCreation',
  parentsInfo = 'parentsInfo',
  lastModified = 'lastModified',
  createdBy = 'createdBy'
}
