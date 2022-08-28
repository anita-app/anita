import { RESERVED_AUDS_KEYS, SystemData } from 'app/data/project-structure/project-info'
import { Manager } from 'app/libs/Manager/Manager.class';
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { storeDispatcher } from 'app/libs/redux/store-dispatcher.function'

/**
 * Sets the current project
 */
export class CurrentProjectSetter {

  /**
   * Creates an instance of current project setter.
   * @param project the project to set as current project
   */
  constructor(
    private projectSettings: SystemData[RESERVED_AUDS_KEYS._settings],
    private sectionsDefinitions: SystemData[RESERVED_AUDS_KEYS._sections]
  ) { }

  /**
   * Dispatches the action to set SystemData in state
   */
  public set(): void {
    const payload = { [RESERVED_AUDS_KEYS._settings]: this.projectSettings.concat(), [RESERVED_AUDS_KEYS._sections]: this.sectionsDefinitions.concat() }
    Manager.setCurrentProject(payload)
    storeDispatcher(({
      type: REDUX_ACTIONS.setCurrentProject,
      payload
    }));
  }

}
