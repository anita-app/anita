import { ANITA_URLS } from 'app/libs/routing/anita-routes.constant'
import { projectInfoNewItem } from 'app/data/project-form-builder/project-info-builder.constant'
import { AnitaUniversalDataStorage, IProjectSettings, RESERVED_AUDS_KEYS } from 'app/data/project-structure/project-info'
import { FileSystemFileHandle } from 'app/libs/db-connector/plugins/file-handles/helpers/file-system-access-api'
import { Manager } from 'app/libs/manager/Manager.class'
import { ProjectFileImporter } from 'app/libs/projects-helpers/project-importers/project-file-importer.class'
import { AnitaStore } from 'app/libs/redux/reducers.const'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { FormAutomator } from 'app/components/shared-components/forms-automator/form-automator.component'
import { FormAutomatorOnChangeValue, FormFieldsModel } from 'app/components/shared-components/forms-automator/form-automator.types'
import { Modal } from 'app/components/shared-components/modals/modal.component'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'

interface IImportProjectButtonProps {
  btnType: 'icon' | 'text'
}

export const ImportProjectButton: React.FC<IImportProjectButtonProps> = (props) => {
  const navigate = useNavigate()
  const validObj = useSelector((state: AnitaStore) => state.formElesValidState)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [animationClass, setAnimationClass] = useState('animate__fadeIn')
  const [projectData, setProjectData] = useState<AnitaUniversalDataStorage | null>(null)
  const [projectFileHandle, setProjectFileHandle] = useState<FileSystemFileHandle>()
  const [projectSettings, setProjectSettings] = useState<IProjectSettings | null>(null)

  const handleClickModal = async () => {
    if (isModalOpen) {
      setAnimationClass('animate__fadeOut')
      setTimeout(() => setIsModalOpen(false), 500)
    } else {
      const { project, fileHandle } = await new ProjectFileImporter().import() || {}

      if (!project) {
        return
      }

      setAnimationClass('animate__fadeIn')
      setIsModalOpen(true)
      setProjectData(project)
      setProjectSettings(project[RESERVED_AUDS_KEYS._settings][0])
      setProjectFileHandle(fileHandle)
    }
  }

  const handleClickImport = async () => {
    projectData![RESERVED_AUDS_KEYS._settings][0] = projectSettings!
    await Manager.importProject(projectData!, projectFileHandle!)
    handleClickModal()
    Manager.setCurrentProject(projectData!)
    setTimeout(() => navigate(ANITA_URLS.projectsList), 500)
  }

  const handleProjectChange = (fieldName: string | number, value: FormAutomatorOnChangeValue) => {
    setProjectSettings({ ...projectSettings!, [fieldName]: value })
  }

  return (
    <span>
      <Button
        id="importProject"
        label="Import an existing project"
        labelClassName={props.btnType === 'icon' ? 'hidden' : undefined}
        icon={props.btnType === 'icon' ? 'downloadOutline' : undefined}
        onClick={handleClickModal}
        type="secondary"
        size={props.btnType === 'text' ? 'lg' : 'sm'}
        className={props.btnType === 'text' ? 'w-full' : ''}
        hasTooltip={props.btnType === 'icon'}
      />
      {isModalOpen && (
        <Modal
          title="Import project"
          actionText="Import"
          type="confirm"
          handleClickAction={handleClickImport}
          closeFn={handleClickModal}
          animationClass={animationClass}
          disableAction={Object.keys(validObj).some(key => validObj[key] === false)}
        >
          {projectSettings && <FormAutomator element={projectSettings} formModel={projectInfoNewItem as Array<FormFieldsModel<any>>} handleChange={handleProjectChange} />}
        </Modal>)}
    </span>
  )
}
