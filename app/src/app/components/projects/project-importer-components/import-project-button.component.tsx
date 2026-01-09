import { ANITA_URLS } from 'app/libs/routing/anita-routes.constant'
import { TAnitaUniversalDataStorage, IProjectSettings, RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { FileSystemFileHandle } from 'app/libs/db-connector/plugins/file-handles/helpers/file-system-access-api'
import { Manager } from 'app/cross-refs-exports'
import { ProjectFileImporter } from 'app/libs/projects-helpers/project-importers/project-file-importer.class'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImportProjectModalContent } from 'app/components/projects/project-importer-components/import-project-modal-content.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { ModalState } from 'app/state/modal/modal-state.class'
import { useAtomValue } from 'jotai'
import { FormElesValidStateAtoms } from 'app/state/form-eles-valid-state/form-eles-valid-state.atoms'
import { FormElementState } from 'app/state/form-element/form-element-state.class'

interface IImportProjectButtonProps {
  btnType: 'icon' | 'text'
}

export const ImportProjectButton: React.FC<IImportProjectButtonProps> = (props) => {
  const navigate = useNavigate()
  const validObj = useAtomValue(FormElesValidStateAtoms.validState)
  const projectData = useRef<TAnitaUniversalDataStorage>()
  const projectFileHandle = useRef<FileSystemFileHandle>()

  const handleClickImport = async () => {
    const projectSettings = FormElementState.getElement() as IProjectSettings
    projectData.current![RESERVED_AUDS_KEYS._settings][0] = projectSettings
    await Manager.importProject(projectData.current!, projectFileHandle.current)
    Manager.setCurrentProject(projectData.current!)
    navigate(ANITA_URLS.projectsList)
  }

  const handleClickModal = async () => {
    const { project, fileHandle } = await new ProjectFileImporter().import() || {}

    if (!project) {
      return
    }

    projectData.current = project
    projectFileHandle.current = fileHandle

    ModalState.showModal({
      title: 'Import project',
      type: Type.primary,
      ctas: [{
        actionText: 'Import',
        handleClickAction: handleClickImport,
        disableAction: Object.keys(validObj).some(key => validObj[key] === false)
      }],
      children: (
        <ImportProjectModalContent projectSettings={project[RESERVED_AUDS_KEYS._settings][0]} />
      )
    })
  }

  return (
    <Button
      id="importProject"
      label="Import an existing project"
      labelClassName={props.btnType === 'icon' ? 'hidden' : undefined}
      iconLeft={props.btnType === 'icon' ? 'downloadOutline' : undefined}
      onClick={handleClickModal}
      type={Type.secondary}
      size={props.btnType === 'text' ? 'lg' : 'sm'}
      className={props.btnType === 'text' ? 'w-full' : ''}
      hasTooltip={props.btnType === 'icon'}
    />
  )
}
