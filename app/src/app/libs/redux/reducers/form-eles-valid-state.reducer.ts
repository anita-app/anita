import { Action } from 'app/libs/redux/action.type'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'

export interface IFormElesValidState {
  [formEleUniqueId: string]: boolean;
}

/**
 * The initial state of the form-eles-valid-state reducer
 */
const initialState: IFormElesValidState = {}

/**
 * The reducer function that sets the valid state of the form elements
 */
export const formElesValidStateReducer = (state: IFormElesValidState = initialState, action: Action<REDUX_ACTIONS>): IFormElesValidState => {
  switch (action.type) {
    case REDUX_ACTIONS.setValidStateForEle:
      return { ...state, [action.payload.formEleId]: action.payload.valid }
    case REDUX_ACTIONS.unsetValidStateForEle:
      const copyState = { ...state }
      delete copyState[action.payload]
      return copyState
    default:
      return state
  }
}
