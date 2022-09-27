import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { storeDispatcher } from 'app/libs/redux/store-dispatcher.function'
import './project-editor-mode-toggle.component.css'
import React from 'react'
import { Toggle } from 'app/components/shared-components/common-ui-eles/toggle.component'
import { PROJECT_EDITOR_MODE } from 'app/data/project-form-builder/project-editor-form-builder.const'
import { store } from 'app/libs/redux/state.store'

export const ProjectEditorModeToggle: React.FC = () => {
  const handleChangeProjectEditorMode = () => {
    storeDispatcher({ type: REDUX_ACTIONS.setProjectEditorMode })
  }

  return (
    <div className="ml-auto">
      <Toggle
        initialState={store.getState().formProject.mode === PROJECT_EDITOR_MODE.advanced}
        label="Advanced mode"
        marginVerticalClassName=""
        labelPosition="left"
        onChange={handleChangeProjectEditorMode}
      />
    </div>
  )
}
