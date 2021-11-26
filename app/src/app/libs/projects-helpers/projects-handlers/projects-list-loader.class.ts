import { dbInstances } from 'app/data/db-instances.const';
import { LocalProjectSettings } from 'app/data/project-structure/project-info';
import { CLIENT_SECTIONS } from 'app/data/system-local-db/client-sections.enum';
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const';
import { store } from 'app/libs/redux/state.store';

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
    store.dispatch(({ type: REDUX_ACTIONS.setProjectList, payload }));
  }

}
