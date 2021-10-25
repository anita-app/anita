import { LocalProjectSettings, SectionDetailsDeclaration, SystemData } from '@anita/client/data/model/project-info';
import { createAction, props } from '@ngrx/store';

/**
 * Supported reducer actions
 */
export const REDUCER_ACTIONS = {
  // PROJECTS
  addProjectToList: createAction('Adds one projct to the list of projects', props<{ payload: LocalProjectSettings }>()),
  setProjectList: createAction('Sets the list of porjects', props<{ payload: Array<LocalProjectSettings> }>()),
  // PROJECT
  setCurrentProject: createAction('Sets the current project', props<{ payload: SystemData }>()),
  // SECTIONS_FOR_CHILD_OF_SELECTOR
  addSectionForChildOfSelector: createAction('Adds a section to the list of selectable parent sections', props<{ payload: SectionDetailsDeclaration }>()),
  resetSectionForChildOfSelector: createAction('Reset the list of selectable parent sections')
};
