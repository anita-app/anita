import { SystemData } from 'app/data/project-structure/project-info';
import { Action } from 'app/libs/redux/action.type';
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const';

/**
 * The initial state of the container of the current project
 */
const projectState: SystemData = null;

/**
 * Updates the projectState
 */
export const projectReducer = (state: SystemData = projectState, action: Action<REDUX_ACTIONS>): SystemData => {
  switch (action.type) {
    case REDUX_ACTIONS.setCurrentProject:
      return action.payload
    default:
      return state;
  }
}
