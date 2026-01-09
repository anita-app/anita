import { Manager } from 'app/cross-refs-exports'
import React, { useCallback } from 'react'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { FORM_COMPONENTS_CODES } from 'app/components/shared-components/forms-automator/form-component-codes.enum'
import { useShortcut } from 'app/components/hooks/shortcut'
import { FormElementState } from 'app/state/form-element/form-element-state.class'
import { useAtomValue } from 'jotai'
import { FormElementAtoms } from 'app/state/form-element/form-element.atoms'
import { FormElesValidStateAtoms } from 'app/state/form-eles-valid-state/form-eles-valid-state.atoms'
import { RoutingState } from 'app/state/routing/routing-state.class'

interface IProjectSectionElementAddEditSaveCancelButtonsProps {
  sectionId: string
}

const saveOnShortcut = (sectionId: string, e: KeyboardEvent) => {
  const currentElementInStore = FormElementState.getElement()
  e.preventDefault()
  Manager.getCurrentProject()?.getSectionById(sectionId)?.saveElement(currentElementInStore!)
}

export const ProjectSectionElementAddEditSaveCancelButtons: React.FC<IProjectSectionElementAddEditSaveCancelButtonsProps> = ({ sectionId }) => {
  const element = useAtomValue(FormElementAtoms.element)
  const validObj = useAtomValue(FormElesValidStateAtoms.validState)

  const handleSave = useCallback(async () => {
    await Manager.getCurrentProject()?.getSectionById(sectionId)?.saveElement(element!)
  }, [element, sectionId])

  const handleSaveAndClose = useCallback(async () => {
    await handleSave()
    RoutingState.goTo(-1)
  }, [handleSave])

  const handleCancel = useCallback(() => {
    RoutingState.goTo(-1)
  }, [])

  useShortcut({ key: 's', withMetaKey: true, callback: saveOnShortcut.bind(undefined, sectionId) })
  useShortcut({ key: 'Escape', callback: handleCancel })

  const hasLongDetailsField = Manager.getCurrentProject()!.getSectionById(sectionId)!.getFirstFieldOfType([FORM_COMPONENTS_CODES.richText]) !== undefined
  const saveAndCloseText = hasLongDetailsField ? 'Save & Close' : 'Save'
  return (
    <div className="mt-6 flex justify-end">
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
          disabled={Object.keys(validObj).some(key => validObj[key] === false)}
          onClick={handleSave}
        />
      )}
      <Button
        id="save"
        label={saveAndCloseText}
        type={Type.primary}
        disabled={Object.keys(validObj).some(key => validObj[key] === false)}
        onClick={handleSaveAndClose}
      />
    </div>
  )
}
