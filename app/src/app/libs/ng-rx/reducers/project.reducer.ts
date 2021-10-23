import { AnitaUniversalDataStorage, SystemData } from '@anita/client/data/model/project-info';
import { REDUCER_ACTIONS } from '@anita/client/libs/ng-rx/ngrx-actions.const';
import { createReducer, on } from '@ngrx/store';

/**
 * The initial state of the container of the current project
 */
export const projectState: SystemData = undefined;

/**
 * Reducer actions for projectState
 */
const _projectReducer = createReducer(projectState,
  on(REDUCER_ACTIONS.setCurrentProject, (state, data) => {
    return data.payload;
  })
);

/**
 * Updates the projectState
 */
export function projectReducer(state: SystemData, action: typeof REDUCER_ACTIONS.setCurrentProject): any {
  return _projectReducer(state, action);
}
