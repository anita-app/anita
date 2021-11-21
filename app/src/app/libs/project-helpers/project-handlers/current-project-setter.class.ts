import { RESERVED_UDS_KEYS, SystemData } from 'app/data/model/project-info';
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const';
import { store } from 'app/libs/redux/state.store';

/**
 * Sets the current project
 */
export class CurrentProjectSetter {

  /**
   * Creates an instance of current project setter.
   * @param project the project to set as current project
   */
  constructor(
    private projectSettings: SystemData[RESERVED_UDS_KEYS._settings],
    private sectionsDefinitions: SystemData[RESERVED_UDS_KEYS._sections]
  ) { }

  /**
   * Dispatches the action to set SystemData in state
   */
  public set(): void {
    store.dispatch(({
      type: REDUX_ACTIONS.setCurrentProject,
      payload: { [RESERVED_UDS_KEYS._settings]: this.projectSettings.concat(), [RESERVED_UDS_KEYS._sections]: this.sectionsDefinitions.concat() }
    }));
  }

}
