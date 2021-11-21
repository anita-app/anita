import { Action } from 'app/libs/redux/action.type';
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const';

export interface ILayoutState {
  sidebar: string;
}

/**
 * The initial state of the container of the current project
 */
const formElementState: ILayoutState = {
  sidebar: '-translate-x-full'
};

/**
 * Updates the projectState
 */
export const layoutReducer = (state: ILayoutState = formElementState, action: Action<REDUX_ACTIONS>): ILayoutState => {
  switch (action.type) {
    case REDUX_ACTIONS.toggleSidebar:
      const newState = { ...state };
      newState.sidebar = newState.sidebar === '-translate-x-full' ? '' : '-translate-x-full';
      return newState;
    default:
      return state;
  }
}
