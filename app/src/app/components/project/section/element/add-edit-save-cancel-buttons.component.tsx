import { useCallback } from 'react'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { FORM_COMPONENTS_CODES } from 'app/components/shared-components/forms-automator/form-component-codes.enum'
import { useShortcut } from 'app/components/hooks/shortcut'
import { FormElementState } from 'app/state/form-element/form-element-state.class'
import { useAtomValue } from 'jotai'
import { FormElementAtoms } from 'app/state/form-element/form-element.atoms'
import { FormElesValidStateAtoms } from 'app/state/form-eles-valid-state/form-eles-valid-state.atoms'
import { RoutingState } from 'app/state/routing/routing-state.class'
import { FormElesValidState } from 'app/state/form-eles-valid-state/form-eles-valid-state.class'
import { Bucket } from 'app/state/bucket.state'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import type { FC } from 'react'

interface IProjectSectionElementAddEditSaveCancelButtonsProps {
  sectionId: string
}

const isFormValid = (validObj: Record<string, boolean>): boolean => !Object.keys(validObj).some(key => validObj[key] === false)

const isEmptyValue = (value: unknown): boolean => value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)

const saveOnShortcut = (sectionId: string, e: KeyboardEvent) => {
  e.preventDefault()
  if (!isFormValid(FormElesValidState.getValidState())) {
    return
  }
  const currentElementInStore = FormElementState.getElement()
  Bucket.general.get(ProjectAtoms.currentProject)?.getSectionById(sectionId)?.saveElement(currentElementInStore!)
}

/**
 * @feature record.save
 * @title Save or cancel a record
 * @summary Saves the record being added or edited, or leaves the form without saving.
 * @where Bottom of the add and edit forms of a record: "Cancel", "Save" and "Save & Close".
 * @usage Click "Save & Close" (or "Save" in sections without a rich text field) to save and go back to the previous page. In sections with a rich text field, "Save" saves and keeps the form open. Press Mod+S to save without leaving the form. Click "Cancel" or press Escape to go back without saving.
 * @options "Save" (stay in the form, only in sections with a rich text field), "Save & Close", "Cancel".
 * @rules The save buttons and Mod+S do nothing while the form is not valid: next to the buttons a message lists the missing required fields ("To save, fill in the required field: ...") or reads "To save, correct the fields marked in red.". Empty values are not stored. The record is saved on this device first, then synced when the project is on Dropbox or WordPress.
 * @errors none
 * @status stable
 * @since 0.1.0
 * @routes projectSectionAddEle, projectSectionEditEle
 * @shortcuts Mod+S, Escape
 * @related record.add, record.edit
 */
export const ProjectSectionElementAddEditSaveCancelButtons: FC<IProjectSectionElementAddEditSaveCancelButtonsProps> = (props) => {
  const element = useAtomValue(FormElementAtoms.element)
  const validObj = useAtomValue(FormElesValidStateAtoms.validState)

  const handleSave = useCallback(async () => {
    await Bucket.general.get(ProjectAtoms.currentProject)?.getSectionById(props.sectionId)?.saveElement(element!)
  }, [element, props.sectionId])

  const handleSaveAndClose = useCallback(async () => {
    await handleSave()
    RoutingState.goTo(-1)
  }, [handleSave])

  const handleCancel = useCallback(() => {
    RoutingState.goTo(-1)
  }, [])

  useShortcut({ key: 's', withMetaKey: true, callback: saveOnShortcut.bind(undefined, props.sectionId) })
  useShortcut({ key: 'Escape', callback: handleCancel })

  const section = Bucket.general.get(ProjectAtoms.currentProject)!.getSectionById(props.sectionId)!
  const hasLongDetailsField = section.getFirstFieldOfType([FORM_COMPONENTS_CODES.richText]) !== undefined
  const saveAndCloseText = hasLongDetailsField ? 'Save & Close' : 'Save'
  const isValid = isFormValid(validObj)
  // Tell what is missing instead of only disabling the button.
  const missingFields = section.formModel
    .filter(formEle => (formEle as { required?: boolean }).required && isEmptyValue(element?.[formEle.fieldName as keyof typeof element]))
    .map(formEle => formEle.label ?? formEle.fieldName)
  let invalidMessage = ''
  if (!isValid) {
    invalidMessage = missingFields.length
      ? `To save, fill in ${missingFields.length === 1 ? 'the required field' : 'the required fields'}: ${missingFields.join(', ')}.`
      : 'To save, correct the fields marked in red.'
  }

  return (
    <div className="mt-6 pt-4 border-t border-[#eef1f5] flex flex-wrap items-center justify-end gap-y-2">
      {invalidMessage && (
        <p
          className="text-sm text-gray-600 mr-auto pr-3"
          role="status"
        >
          {invalidMessage}
        </p>
      )}
      <Button
        id="cancel"
        label="Cancel"
        type={Type.secondary}
        onClick={handleCancel}
      />
      {hasLongDetailsField && (
        <Button
          id="save"
          label="Save"
          type={Type.primary}
          fill="outline"
          disabled={!isValid}
          onClick={handleSave}
        />
      )}
      <Button
        id="save"
        label={saveAndCloseText}
        iconLeft="checkmarkOutline"
        type={Type.primary}
        disabled={!isValid}
        onClick={handleSaveAndClose}
      />
    </div>
  )
}
