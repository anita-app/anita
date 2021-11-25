import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const';
import { store } from 'app/libs/redux/state.store';
import './project-editor-mode-toggle.component.css';
export const ProjectEditorModeToggle = () => {

  const handleChangeProjectEditorMode = () => {
    store.dispatch({ type: REDUX_ACTIONS.setProjectEditorMode });
  };

  return (
    <div className="ml-auto">
      <label htmlFor="project-editor-mode-toggle" className="flex items-center cursor-pointer">
        <div className="mr-3 text-gray-700 font-medium">
          Advanced mode
        </div>
        <div className="relative">
          <input type="checkbox" id="project-editor-mode-toggle" className="sr-only" onChange={handleChangeProjectEditorMode} />
          <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
          <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
        </div>
      </label>

    </div>
  )
}