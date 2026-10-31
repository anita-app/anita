import { RESERVED_FIELDS } from 'app/models/reserved-fields.constant'
import { FORM_COMPONENTS_CODES } from 'app/components/shared-components/forms-automator/form-component-codes.enum'
import type { FormFieldsModel, TSupportedFormsTypes } from 'app/components/shared-components/forms-automator/form-automator.types'
import type { ISectionElement } from 'app/models/section-element/section-element.declarations'

const isShortText = (formEle: FormFieldsModel<TSupportedFormsTypes>): boolean => (
  Number(formEle.componentCode) === FORM_COMPONENTS_CODES.basicInput && (!('type' in formEle) || !formEle.type || formEle.type === 'text')
)

/**
 * The field that names the records of a section (e.g. the name of a client), found without any setting:
 * the first field when it is a short text, otherwise the first required short text.
 * @feature record.title
 * @title The field that names the records
 * @summary Each record is named after one of its fields (for example the name of a client), chosen automatically, without any setting.
 * @where Everywhere a record is named: first, bold column of tables (also of the linked records on a details page), title of the cards in the grid view, header of the details page, header of the edit form ("Edit" followed by the name), links to linked records and the "Linked to" selector of the form.
 * @usage Nothing to set: to choose the field that names the records, put a Short text field (Content type Text) first in the section in the project editor, or make it required.
 * @options none
 * @rules The name field is the first field of the section when it is a Short text of type Text; otherwise the first required Short text of type Text. Lists show it as the first column, whatever the order of the fields. When the section has no such field, lists keep the order of the fields and use the first field where a name is needed (grid cards, "Linked to" field); the details page reads "Details" and the edit form "Edit record". Spaces at the beginning and end are ignored; a record whose name is empty has no title in its header and is shown as "Untitled" in the links to it.
 * @errors none
 * @status stable
 * @since 1.0.0
 * @routes projectSectionElesList, projectSectionEleDetails, projectSectionEditEle
 * @related field.short-text, relation.link-to-parent, view.table, view.grid, record.details
 */
export const getTitleField = (formModel: Array<FormFieldsModel<TSupportedFormsTypes>>): FormFieldsModel<TSupportedFormsTypes> | undefined => {
  const fields = formModel.filter(formEle => !RESERVED_FIELDS[formEle.fieldName as keyof typeof RESERVED_FIELDS] && formEle.label && Number(formEle.componentCode) !== FORM_COMPONENTS_CODES.hiddenInput)
  if (fields[0] && isShortText(fields[0])) {
    return fields[0]
  }
  return fields.find(formEle => isShortText(formEle) && formEle.required)
}

/**
 * The field shown as the name of records where something must be shown: the title field, otherwise the first field.
 * @featurePart record.title
 */
export const getTitleFieldOrFirst = (formModel: Array<FormFieldsModel<TSupportedFormsTypes>>): FormFieldsModel<TSupportedFormsTypes> | undefined => (
  getTitleField(formModel) ?? formModel.find(formEle => !RESERVED_FIELDS[formEle.fieldName as keyof typeof RESERVED_FIELDS])
)

/**
 * Puts the title field first, so that lists start with the name of each record.
 * @featurePart record.title
 */
export const withTitleFieldFirst = <T extends FormFieldsModel<TSupportedFormsTypes>>(columns: Array<T>, formModel: Array<FormFieldsModel<TSupportedFormsTypes>>): Array<T> => {
  const titleField = getTitleField(formModel)
  const index = titleField ? columns.findIndex(column => column.fieldName === titleField.fieldName) : -1
  return index > 0 ? [columns[index], ...columns.slice(0, index), ...columns.slice(index + 1)] : columns
}

/**
 * The title of a record, or undefined if its section has no title field or the record leaves it empty.
 * @featurePart record.title
 */
export const getRecordTitle = (formModel: Array<FormFieldsModel<TSupportedFormsTypes>>, element: ISectionElement | null | undefined): { title: string; fieldName: string } | undefined => {
  const field = getTitleField(formModel)
  const value = field && element ? element[field.fieldName] : undefined
  if (typeof value !== 'string' || !value.trim()) {
    return undefined
  }
  return { title: value.trim(), fieldName: field!.fieldName }
}
