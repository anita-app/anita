import React from 'react'
import { Toggle } from 'app/components/shared-components/common-ui-eles/toggle.component'
import { PROJECT_EDITOR_MODE } from 'app/data/project-form-builder/project-editor-form-builder.const'
import { FormProjectState } from 'app/state/form-project/form-project-state.class'
import { useAtomValue } from 'jotai'
import { FormProjectAtoms } from 'app/state/form-project/form-project.atoms'

export const ProjectEditorModeToggle: React.FC = () => {
  const projectEditorMode = useAtomValue(FormProjectAtoms.mode)
  const handleChangeProjectEditorMode = () => {
    FormProjectState.toggleProjectEditorMode()
  }

  return (
    <div className="ml-auto">
      <Toggle
        initialState={projectEditorMode === PROJECT_EDITOR_MODE.advanced}
        label="Advanced mode"
        marginVerticalClassName=""
        labelPosition="left"
        onChange={handleChangeProjectEditorMode}
      />
    </div>
  )
}
