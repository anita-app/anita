import { FormAutomator } from 'app/components/shared-components/forms-automator/form-automator.component'
import { FormAutomatorOnChangeValue, FormFieldsModel } from 'app/components/shared-components/forms-automator/form-automator.types'
import { projectInfoNewItem } from 'app/data/project-form-builder/project-info-builder.constant'
import { IProjectSettings } from 'app/data/project-structure/project-info'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { storeDispatcher } from 'app/libs/redux/store-dispatcher.function'
import React, { useEffect, useState } from 'react'

interface IImportProjectModalContentProps {
  projectSettings: IProjectSettings | null
}

export const ImportProjectModalContent: React.FC<IImportProjectModalContentProps> = (props) => {
  const [projectSettings, setProjectSettings] = useState<IProjectSettings | null>(props.projectSettings)
  const handleProjectChange = (fieldName: string | number, value: FormAutomatorOnChangeValue) => {
    setProjectSettings(currenntValue => ({ ...currenntValue!, [fieldName]: value }))
  }

  useEffect(() => {
    storeDispatcher({
      type: REDUX_ACTIONS.updateFormElement,
      payload: projectSettings!
    })
  }, [projectSettings])

  if (!projectSettings) {
    return null
  }

  return (
    <FormAutomator element={projectSettings} formModel={projectInfoNewItem as Array<FormFieldsModel<any>>} handleChange={handleProjectChange} />
  )
}
