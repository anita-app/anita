import { Toggle } from 'app/components/shared-components/common-ui-eles/toggle.component'
import { PROJECT_EDITOR_MODE } from 'app/data/project-form-builder/project-editor-form-builder.const'
import { FormProjectState } from 'app/state/form-project/form-project-state.class'
import { useAtomValue } from 'jotai'
import { FormProjectAtoms } from 'app/state/form-project/form-project.atoms'
import type { FC } from 'react'

/**
 * @feature project.advanced-editor
 * @title Advanced mode of the project editor
 * @summary Shows the technical settings of the fields: the identifier of each field and the stored value of each choice.
 * @where "Advanced mode" toggle at the top right of the "Add Project" / "Edit Project" editor.
 * @usage 1. Turn on "Advanced mode".
 * 2. Set the "Identifier" of new fields and the "Value" of the choices of drop-down and choice fields.
 * @options Off by default (basic mode): identifiers are created from the field labels and choice values are numbered automatically.
 * @rules Identifiers of fields that already exist are shown but cannot be changed. The mode stays as set until the app is
 * reloaded.
 * @errors none
 * @status stable
 * @since 0.8.0
 * @related section.fields, project.edit
 */
export const ProjectEditorModeToggle: FC = () => {
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
