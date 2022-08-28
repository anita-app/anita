import { SectionDetailsDeclaration } from 'app/data/project-structure/project-info'
import { Action } from 'app/libs/redux/action.type'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'

/**
 * The initial state of the container of the sections selectable by the child of selector
 */
const sectionsForChildOfSelectorState: Array<SectionDetailsDeclaration> = []

/**
 * Updates the sections selectable by the child of selector component
 *
 * @see ChildOfSelectorForSectionComponent
 */
export const sectionsForChildOfSelectorReducer = (state: Array<SectionDetailsDeclaration> = sectionsForChildOfSelectorState, action: Action<REDUX_ACTIONS>) => {
  switch (action.type) {
    case REDUX_ACTIONS.addSectionForChildOfSelector:
      const editableState = state.concat()

      if (!editableState.length) {
        editableState.push(action.payload)
      } else {
        const index = editableState.findIndex(sectionDeclaration => sectionDeclaration.id === action.payload.id)
        const position = index >= 0 ? index : editableState.length
        editableState[position] = action.payload
      }
      return editableState

    default:
      return state
  }
}
