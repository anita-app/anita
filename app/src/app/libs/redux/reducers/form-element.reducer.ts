import { ISectionElement } from 'app/models/section-element/section-element.declarations'
import { Action } from 'app/libs/redux/action.type'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'

export interface IFormElementState {
  element: ISectionElement | undefined | null
}

/**
 * The initial state of the container of the current project
 */
const formElementState: IFormElementState = {
  element: null
}

/**
 * Updates the projectState
 */
export const formElementReducer = (state: IFormElementState = formElementState, action: Action<REDUX_ACTIONS>): IFormElementState => {
  switch (action.type) {
    case REDUX_ACTIONS.updateFormElement:
      return {
        element: { ...action.payload }
      }
    case REDUX_ACTIONS.updateFormElementKey:
      return {
        element: { ...state.element, [action.payload.fieldName]: action.payload.value }
      }
    default:
      return state
  }
}
