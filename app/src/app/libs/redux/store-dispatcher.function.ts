import { Action } from 'app/libs/redux/action.type'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { store } from 'app/libs/redux/state.store'

export function storeDispatcher<T extends REDUX_ACTIONS> (action: Action<T>): void {
  store.dispatch(action)
}
