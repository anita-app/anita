import { RESERVED_UDS_KEYS, SystemData } from '@anita/client/data/model/project-info';
import { REDUCER_ACTIONS } from '@anita/client/libs/ng-rx/ngrx-actions.const';
import { stateData } from '@anita/client/ng-services/state-data/state-data.constant';
import { cloneDeep } from 'lodash';

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
    stateData.ngRxStore.dispatch(REDUCER_ACTIONS.setCurrentProject({ payload: { [RESERVED_UDS_KEYS._settings]: cloneDeep(this.projectSettings), [RESERVED_UDS_KEYS._sections]: cloneDeep(this.sectionsDefinitions) } }));
  }

}
