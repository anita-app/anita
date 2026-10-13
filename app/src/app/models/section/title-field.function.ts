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
 */
export const getTitleFieldOrFirst = (formModel: Array<FormFieldsModel<TSupportedFormsTypes>>): FormFieldsModel<TSupportedFormsTypes> | undefined => (
  getTitleField(formModel) ?? formModel.find(formEle => !RESERVED_FIELDS[formEle.fieldName as keyof typeof RESERVED_FIELDS])
)

/**
 * Puts the title field first, so that lists start with the name of each record.
 */
export const withTitleFieldFirst = <T extends FormFieldsModel<TSupportedFormsTypes>>(columns: Array<T>, formModel: Array<FormFieldsModel<TSupportedFormsTypes>>): Array<T> => {
  const titleField = getTitleField(formModel)
  const index = titleField ? columns.findIndex(column => column.fieldName === titleField.fieldName) : -1
  return index > 0 ? [columns[index], ...columns.slice(0, index), ...columns.slice(index + 1)] : columns
}

/**
 * The title of a record, or undefined if its section has no title field or the record leaves it empty.
 */
export const getRecordTitle = (formModel: Array<FormFieldsModel<TSupportedFormsTypes>>, element: ISectionElement | null | undefined): { title: string; fieldName: string } | undefined => {
  const field = getTitleField(formModel)
  const value = field && element ? element[field.fieldName] : undefined
  if (typeof value !== 'string' || !value.trim()) {
    return undefined
  }
  return { title: value.trim(), fieldName: field!.fieldName }
}
