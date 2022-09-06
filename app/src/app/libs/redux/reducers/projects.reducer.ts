import { LocalProjectSettings } from 'app/models/project-n/project.declarations'
import { Action } from 'app/libs/redux/action.type'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'

/**
 * The initial state of the container of the current project
 */
export const projectsState: Array<LocalProjectSettings> | null = null

/**
 * Updates the projectsState
 */
export const projectsReducer = (state: Array<LocalProjectSettings> | null = projectsState, action: Action<REDUX_ACTIONS>) => {
  switch (action.type) {
    case REDUX_ACTIONS.addProjectToList:
      return state ? state.concat(action.payload) : [action.payload]
    case REDUX_ACTIONS.setProjectList:
      return action.payload
    default:
      return state
  }
}
