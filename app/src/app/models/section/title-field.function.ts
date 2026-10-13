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
