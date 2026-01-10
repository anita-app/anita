import { ANITA_URLS } from 'app/libs/routing/anita-routes.constant'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { LOCAL_STORAGE_SYSTEMS } from 'app/data/local-dbs/local-storage-systems.enum'
import { Manager } from 'app/cross-refs-exports'
import { ProjectFileImporter } from 'app/libs/projects-helpers/project-importers/project-file-importer.class'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { useRef } from 'react'
import { ImportProjectModalContent } from 'app/components/projects/project-importer-components/import-project-modal-content.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { ModalState } from 'app/state/modal/modal-state.class'
import { useAtomValue } from 'jotai'
import { FormElesValidStateAtoms } from 'app/state/form-eles-valid-state/form-eles-valid-state.atoms'
import { FormElementState } from 'app/state/form-element/form-element-state.class'
import { RoutingState } from 'app/state/routing/routing-state.class'
import type { FC } from 'react'
import type { IProjectSettings, TAnitaUniversalDataStorage } from 'app/models/project/project.declarations'

interface IImportProjectButtonProps {
  btnType: 'icon' | 'text'
}

export const ImportProjectButton: FC<IImportProjectButtonProps> = (props) => {
  const validObj = useAtomValue(FormElesValidStateAtoms.validState)
  const projectData = useRef<TAnitaUniversalDataStorage>(null)

  const handleClickImport = async () => {
    const projectSettings = FormElementState.getElement() as IProjectSettings
    projectData.current![RESERVED_AUDS_KEYS._settings][0] = { ...projectSettings, localStorage: LOCAL_STORAGE_SYSTEMS.IndexedDB }
    await Manager.importProject(projectData.current!)
    Manager.setCurrentProject(projectData.current!)
    RoutingState.goTo(ANITA_URLS.projectsList)
  }

  const handleClickModal = async () => {
    const { project } = await new ProjectFileImporter().import() || {}

    if (!project) {
      return
    }

    projectData.current = project

    ModalState.showModal({
      title: 'Import project',
      type: Type.primary,
      ctas: [{
        actionText: 'Import',
        handleClickAction: handleClickImport,
        disableAction: Object.keys(validObj).some(key => validObj[key] === false),
      }],
      children: (
        <ImportProjectModalContent projectSettings={project[RESERVED_AUDS_KEYS._settings][0]} />
      ),
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
