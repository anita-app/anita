import { SystemData } from 'app/data/project-structure/project-info'
import { Action } from 'app/libs/redux/action.type'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'

/**
 * The initial state of the container of the current project
 */
const projectState: SystemData | null = null

/**
 * Updates the projectState
 */
export const projectReducer = (state: SystemData | null = projectState, action: Action<REDUX_ACTIONS>): SystemData | null => {
  switch (action.type) {
    case REDUX_ACTIONS.setCurrentProject:
      return action.payload
    case REDUX_ACTIONS.resetCurrentProject:
      return null
    default:
      return state
  }
}
