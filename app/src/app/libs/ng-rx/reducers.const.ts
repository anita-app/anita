import { AnitaUniversalDataStorage, LocalProjectSettings, SectionDetailsDeclaration } from '@anita/client/data/model/project-info';
import { projectReducer } from '@anita/client/libs/ng-rx/reducers/project.reducer';
import { projectsReducer } from '@anita/client/libs/ng-rx/reducers/projects.reducer';
import { sectionsForChildOfSelectorReducer } from '@anita/client/libs/ng-rx/reducers/sections-for-child-of-selector.reducer';

/**
 * Supported reducers
 */
export const REDUCERS = {
  project: projectReducer,
  projects: projectsReducer,
  sectionsForChildOfSelector: sectionsForChildOfSelectorReducer
};

/**
 * Types managed by reducers
 */
export interface ReducerTypes {
  project: AnitaUniversalDataStorage;
  projects: Array<LocalProjectSettings>;
  sectionsForChildOfSelector: Array<SectionDetailsDeclaration>;
}
