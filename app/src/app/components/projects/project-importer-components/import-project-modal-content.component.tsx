import { FormAutomator } from 'app/components/shared-components/forms-automator/form-automator.component'
import { projectInfoNewItem } from 'app/data/project-form-builder/project-info-builder.constant'
import { LOCAL_STORAGE_SYSTEMS } from 'app/data/local-dbs/local-storage-systems.enum'
import { useEffect, useState } from 'react'
import { FormElementState } from 'app/state/form-element/form-element-state.class'
import type { FC } from 'react'
import type { IProjectSettings } from 'app/models/project/project.declarations'
import type { FormAutomatorOnChangeValue, FormFieldsModel } from 'app/components/shared-components/forms-automator/form-automator.types'

interface IImportProjectModalContentProps {
  projectSettings: IProjectSettings | null
}

export const ImportProjectModalContent: FC<IImportProjectModalContentProps> = (props) => {
  const projectInfoNewItemClone: Array<FormFieldsModel<any>> = JSON.parse(JSON.stringify(projectInfoNewItem))
  const [projectSettings, setProjectSettings] = useState<IProjectSettings | null>(
    props.projectSettings ? { ...props.projectSettings, localStorage: LOCAL_STORAGE_SYSTEMS.IndexedDB } : null,
  )

  const handleProjectChange = (fieldName: string | number, value: FormAutomatorOnChangeValue) => {
    setProjectSettings(currenntValue => ({ ...currenntValue!, [fieldName]: value }))
  }

  useEffect(() => {
    if (projectSettings) {
      FormElementState.setElement(projectSettings)
    }
  }, [projectSettings])

  if (!projectSettings) {
    return null
  }

  return (
    <FormAutomator
      element={projectSettings}
      formModel={projectInfoNewItemClone as Array<FormFieldsModel<any>>}
      handleChange={handleProjectChange}
    />
  )
}
