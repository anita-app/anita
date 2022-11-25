import { FormAutomator } from 'app/components/shared-components/forms-automator/form-automator.component'
import { FormAutomatorOnChangeValue, FormFieldsModel, IBasicRadio } from 'app/components/shared-components/forms-automator/form-automator.types'
import { projectInfoNewItem } from 'app/data/project-form-builder/project-info-builder.constant'
import { IProjectSettings } from 'app/models/project/project.declarations'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { storeDispatcher } from 'app/libs/redux/store-dispatcher.function'
import React, { useEffect, useState } from 'react'

interface IImportProjectModalContentProps {
  projectSettings: IProjectSettings | null
}

const getSupportedStorageOptions = (projectInfoNewItem: Array<FormFieldsModel<IProjectSettings>>): Array<IProjectSettings['localStorage']> => (
  (projectInfoNewItem.find(item => item.fieldName === 'localStorage') as IBasicRadio<IProjectSettings>).options.filter(option => !option.disabled).map(option => option.value as IProjectSettings['localStorage'])
)

const ensureSelectedStorageIsSupported = (projectSettings: IProjectSettings | null, supportedStorageOptions: Array<IProjectSettings['localStorage']>): IProjectSettings | null => {
  if (!projectSettings) {
    return null
  }

  if (supportedStorageOptions.includes(parseInt(projectSettings.localStorage as unknown as string, 10))) {
    return projectSettings
  }
  return {
    ...projectSettings,
    localStorage: supportedStorageOptions[0] as IProjectSettings['localStorage']
  }
}

export const ImportProjectModalContent: React.FC<IImportProjectModalContentProps> = (props) => {
  const projectInfoNewItemClone: Array<FormFieldsModel<any>> = JSON.parse(JSON.stringify(projectInfoNewItem))
  const supportedStorageOptions: Array<IProjectSettings['localStorage']> = getSupportedStorageOptions(projectInfoNewItemClone)
  const [projectSettings, setProjectSettings] = useState<IProjectSettings | null>(ensureSelectedStorageIsSupported(props.projectSettings, supportedStorageOptions))
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

  if (supportedStorageOptions.length === 1) {
    const index = projectInfoNewItemClone.findIndex(item => item.fieldName === 'localStorage')
    projectInfoNewItemClone.splice(index, 1)
  }

  return (
    <FormAutomator element={projectSettings} formModel={projectInfoNewItemClone as Array<FormFieldsModel<any>>} handleChange={handleProjectChange} />
  )
}
