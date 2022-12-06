import { Manager } from 'app/libs/manager/manager.class'
import { AnitaStore } from 'app/libs/redux/reducers.const'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import React, { useCallback } from 'react'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { FORM_COMPONENTS_CODES } from 'app/components/shared-components/forms-automator/form-component-codes.enum'
import { useShortcut } from 'app/components/hooks/use-shortcut'
import { store } from 'app/libs/redux/state.store'

interface IProjectSectionElementAddEditSaveCancelButtonsProps {
  sectionId: string
}

const saveOnShortcut = (sectionId: string, e: KeyboardEvent) => {
  const currentElementInStore = store.getState().formElement.element
  e.preventDefault()
  Manager.getCurrentProject()?.getSectionById(sectionId)?.saveElement(currentElementInStore!)
}

export const ProjectSectionElementAddEditSaveCancelButtons: React.FC<IProjectSectionElementAddEditSaveCancelButtonsProps> = ({ sectionId }) => {
  const element = useSelector((state: AnitaStore) => state.formElement.element)
  const validObj = useSelector((state: AnitaStore) => state.formElesValidState)
  const navigate = useNavigate()

  const handleSave = useCallback(async () => {
    await Manager.getCurrentProject()?.getSectionById(sectionId)?.saveElement(element!)
  }, [element, sectionId])

  const handleSaveAndClose = useCallback(async () => {
    await handleSave()
    navigate(-1)
  }, [handleSave, navigate])

  const handleCancel = useCallback(() => {
    navigate(-1)
  }, [navigate])

  useShortcut({ key: 's', withMetakey: true, callback: saveOnShortcut.bind(undefined, sectionId) })
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
