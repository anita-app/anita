import { SectionDetailsDeclaration, SystemData } from '@anita/client/data/model/project-info';
import { REDUCER_ACTIONS } from '@anita/client/libs/ng-rx/ngrx-actions.const';
import { createReducer, on } from '@ngrx/store';
import { cloneDeep } from 'lodash';

/**
 * The initial state of the container of the sections selectable by the child of selector
 */
export const sectionsForChildOfSelectorState: Array<SectionDetailsDeclaration> = [];

/**
 * Reducer actions for sectionsForChildOfSelectorState
 */
const _sectionsForChildOfSelector = createReducer(sectionsForChildOfSelectorState,
  on(REDUCER_ACTIONS.addSectionForChildOfSelector, (state, data) => {
    const editableState = cloneDeep(state);

    if (!editableState.length)
      editableState.push(data.payload);
    else {
      const index = editableState.findIndex(sectionDeclaration => sectionDeclaration.id === data.payload.id);
      const position = index >= 0 ? index : editableState.length;
      editableState[position] = data.payload;
    }
    return editableState;
  }),
  on(REDUCER_ACTIONS.resetSectionForChildOfSelector, state => {
    return [];
  })
);

/**
 * Updates the sections selectable by the child of selector component
 * 
 * @see ChildOfSelectorForSectionComponent
 */
export function sectionsForChildOfSelectorReducer(state: Array<SectionDetailsDeclaration>, action: typeof REDUCER_ACTIONS.addSectionForChildOfSelector | typeof REDUCER_ACTIONS.resetSectionForChildOfSelector): any {
  return _sectionsForChildOfSelector(state, action);
}
