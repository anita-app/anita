import { CLIENT_SECTIONS } from '@anita/client/data/client-sections.enum';
import { dbInstances } from '@anita/client/data/db-instances.const';
import { LocalProjectSettings } from '@anita/client/data/model/project-info';
import { REDUCER_ACTIONS } from '@anita/client/libs/ng-rx/ngrx-actions.const';
import { stateData } from '@anita/client/ng-services/state-data/state-data.constant';

/**
 * Loads the list of projects on the current device
 */
export class ProjectsListLoader {

  /**
   * The list of projects to sore in the current state
   */
  private projectList: Array<LocalProjectSettings> = [];

  /**
   * Loads the projects from IndexedDB and adds them to the current state
   */
  public async load(): Promise<void> {
    await this.loadFromLocalDB();
    this.dispatchProjectList(this.projectList);
  }

  /**
   * Loads the projects from IndexedDB with db-connector
   */
  private async loadFromLocalDB(): Promise<void> {
    this.projectList = await dbInstances.system.callSelector<LocalProjectSettings>(CLIENT_SECTIONS.projects).multiple();
  }

  /**
   * Dispatchs the project list to the current state
   */
  private dispatchProjectList(payload: Array<LocalProjectSettings>): void {
    stateData.ngRxStore.dispatch(REDUCER_ACTIONS.setProjectList({ payload }));
  }

}
