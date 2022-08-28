import { LocalProjectSettings, SectionDetailsDeclaration, SystemData } from 'app/data/project-structure/project-info'
import { formElementReducer, IFormElementState } from 'app/libs/redux/reducers/form-element.reducer'
import { formElesValidStateReducer, IFormElesValidState } from 'app/libs/redux/reducers/form-eles-valid-state.reducer'
import { formProjectReducer, IFormProjectState } from 'app/libs/redux/reducers/form-project.reducer'
import { ILayoutState, layoutReducer } from 'app/libs/redux/reducers/layout.reducer'
import { projectReducer } from 'app/libs/redux/reducers/project.reducer'
import { projectsReducer } from 'app/libs/redux/reducers/projects.reducer'
import { sectionsForChildOfSelectorReducer } from 'app/libs/redux/reducers/sections-for-child-of-selector.reducer'

/**
 * Supported reducers
 */
export const REDUCERS = {
  project: projectReducer,
  projects: projectsReducer,
  sectionsForChildOfSelector: sectionsForChildOfSelectorReducer,
  formElesValidState: formElesValidStateReducer,
  formElement: formElementReducer,
  formProject: formProjectReducer,
  layout: layoutReducer
}

/**
 * Types managed by reducers
 */
export interface AnitaStore {
  project: SystemData;
  projects: Array<LocalProjectSettings>;
  sectionsForChildOfSelector: Array<SectionDetailsDeclaration>;
  formElesValidState: IFormElesValidState;
  formElement: IFormElementState;
  formProject: IFormProjectState;
  layout: ILayoutState;
}
