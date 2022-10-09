import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { SectionFormModelManager } from 'app/components/projects/add-edit-project-components/section-form-model-manager.component'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { useModalContext } from 'app/components/shared-components/modals/modal-context'
import { Manager } from 'app/libs/manager/manager.class'
import { ProjectsListLoader } from 'app/libs/projects-helpers/projects-handlers/projects-list-loader.class'
import { AnitaStore } from 'app/libs/redux/reducers.const'
import { RESERVED_AUDS_KEYS, TSystemData } from 'app/models/project/project.declarations'
import React from 'react'
import { useSelector } from 'react-redux'

interface IListTabsHeaderRightAddFieldProps {
  sectionId: string
}

export const ListTabsHeaderRightAddField: React.FC<IListTabsHeaderRightAddFieldProps> = (props) => {
  const project = useSelector((state: AnitaStore) => state.formProject.project)
  const validObj = useSelector((state: AnitaStore) => state.formElesValidState)
  const sections = project[RESERVED_AUDS_KEYS._sections]!
  const sectionIndex = sections?.findIndex((section) => section.id === props.sectionId)

  const { hideModal } = useModalContext()

  if (!sections || sectionIndex === -1 || sectionIndex === undefined) {
    return null
  }

  const handleActionClick = async () => {
    const systemData = await Manager.saveProject(project as TSystemData, EDITOR_MODE.edit)
    await new ProjectsListLoader().load()
    Manager.setCurrentProject(systemData)
    hideModal()
  }

  const lastSectionFormElementIndex = sections[sectionIndex].formModel.length - 1

  return (
    <div className="-ml-1">
      <SectionFormModelManager
        indexFormElement={lastSectionFormElementIndex}
        indexSection={sectionIndex}
        element={sections[sectionIndex].formModel[lastSectionFormElementIndex]}
        forceFullWidth={true}
      />
      <div className="flex items-center justify-end mt-5 sm:mt-4">
        <Button
          id="cancel"
          label="Cancel"
          type={Type.secondary}
          onClick={hideModal}
        />
        <Button
          id="action-button"
          type={Type.primary}
          label={'Add'}
          onClick={handleActionClick}
          disabled={Object.keys(validObj).some(key => validObj[key] === false)}
        />
      </div>
    </div>
  )
}
