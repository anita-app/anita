import { LocalProjectSettings } from 'app/data/project-structure/project-info';
import { Action } from 'app/libs/redux/action.type';
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const';

/**
 * The initial state of the container of the current project
 */
export const projectsState: Array<LocalProjectSettings> = null;

/**
 * Updates the projectsState
 */
export const projectsReducer = (state: Array<LocalProjectSettings> = projectsState, action: Action<REDUX_ACTIONS>) => {
  switch (action.type) {
    case REDUX_ACTIONS.addProjectToList:
      return state.concat(action.payload);
    case REDUX_ACTIONS.setProjectList:
      return action.payload;
    default:
      return state;
  }
};