import { AnitaUniversalDataStorage, LocalProjectSettings } from '@anita/client/data/model/project-info';
import { projectReducer } from '@anita/client/libs/ng-rx/reducers/project.reducer';
import { projectsReducer } from '@anita/client/libs/ng-rx/reducers/projects.reducer';

/**
 * Supported reducers
 */
export const REDUCERS = {
  project: projectReducer,
  projects: projectsReducer
};

/**
 * Types managed by reducers
 */
export interface ReducerTypes {
  project: AnitaUniversalDataStorage;
  projects: Array<LocalProjectSettings>;
}
