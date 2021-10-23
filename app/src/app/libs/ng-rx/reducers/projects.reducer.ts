import { LocalProjectSettings } from '@anita/client/data/model/project-info';
import { REDUCER_ACTIONS } from '@anita/client/libs/ng-rx/ngrx-actions.const';
import { createReducer, on } from '@ngrx/store';
import cloneDeep from 'lodash.clonedeep';

/**
 * The initial state of the container of the current project
 */
export const projectsState: Array<LocalProjectSettings> = [];

/**
 * Reducer actions for projectsState
 */
const _projectsReducer = createReducer(projectsState,
  on(REDUCER_ACTIONS.addProjectToList, (state, data) => {
    const newList = cloneDeep(state);
    newList.push(data.payload);
    return newList;
  }),
  on(REDUCER_ACTIONS.setProjectList, (state, data) => {
    return data.payload;
  })
);

/**
 * Updates the projectsState
 */
export function projectsReducer(state: Array<LocalProjectSettings>, action: typeof REDUCER_ACTIONS.addProjectToList | typeof REDUCER_ACTIONS.setProjectList): any {
  return _projectsReducer(state, action);
}
