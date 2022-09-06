import { TSystemData } from 'app/models/project/project.declarations'
import { Action } from 'app/libs/redux/action.type'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'

/**
 * The initial state of the container of the current project
 */
const projectState: TSystemData | null = null

/**
 * Updates the projectState
 */
export const projectReducer = (state: TSystemData | null = projectState, action: Action<REDUX_ACTIONS>): TSystemData | null => {
  switch (action.type) {
    case REDUX_ACTIONS.setCurrentProject:
      return action.payload
    case REDUX_ACTIONS.resetCurrentProject:
      return null
    default:
      return state
  }
}
