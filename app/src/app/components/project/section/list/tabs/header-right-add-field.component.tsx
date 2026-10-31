import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { SectionFormModelManager } from 'app/components/projects/add-edit-project-components/section-form-model-manager.component'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { Manager } from 'app/cross-refs-exports'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { ModalState } from 'app/state/modal/modal-state.class'
import { useAtomValue } from 'jotai'
import { FormProjectAtoms } from 'app/state/form-project/form-project.atoms'
import { FormElesValidStateAtoms } from 'app/state/form-eles-valid-state/form-eles-valid-state.atoms'
import { ProjectSaver } from 'app/models/project/project-saver.class'
import type { FC } from 'react'
import type { TSystemData } from 'app/models/project/project.declarations'

interface IListTabsHeaderRightAddFieldProps {
  sectionId: string
}

/**
 * @feature view.add-field
 * @title Add a field from the list
 * @summary Adds a new field to a section without opening the project editor.
 * @where List of a section, table view: gear icon "Edit view", then "Add field" at the bottom of the "Edit visible columns" window.
 * @usage Click "Add field", fill in the new field (name, type and its settings) in the "Add field" window, then click "Add". Click "Cancel" to close without adding.
 * @options The same field types and settings as in the project editor.
 * @rules "Add" is disabled while the new field is not valid (for example without a name). The field is added at the end of the section and the project is saved; existing records have no value for it until they are edited.
 * @errors none
 * @status stable
 * @since 0.17.0
 * @routes projectSectionElesList
 * @related view.table-columns
 */
export const ListTabsHeaderRightAddField: FC<IListTabsHeaderRightAddFieldProps> = (props) => {
  const project = useAtomValue(FormProjectAtoms.project)
  const validObj = useAtomValue(FormElesValidStateAtoms.validState)
  const sections = project[RESERVED_AUDS_KEYS._sections]!
  const sectionIndex = sections?.findIndex((section) => section.id === props.sectionId)

  if (!sections || sectionIndex === -1 || sectionIndex === undefined) {
    return null
  }

  const handleActionClick = async () => {
    const systemData = await new ProjectSaver(project as TSystemData, EDITOR_MODE.edit).save()
    Manager.setCurrentProject(systemData)
    ModalState.hideModal()
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
          onClick={ModalState.hideModal}
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
