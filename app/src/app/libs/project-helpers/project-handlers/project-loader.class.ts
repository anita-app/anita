import { CLIENT_SECTIONS } from 'app/data/client-sections.enum';
import { dbInstances } from 'app/data/db-instances.const';
import { LocalProjectSettings, RESERVED_UDS_KEYS } from 'app/data/model/project-info';
import { DbConnector } from 'app/libs/db-connector/db-connector.class';
import { FILE_HANDLES_PLUGIN } from 'app/libs/db-connector/plugins/file-handles/exporter.constant';
import { CurrentProjectSetter } from 'app/libs/project-helpers/project-handlers/current-project-setter.class';

export class ProjectLoader {

  /**
   * The project info of the project to load
   */
  private projectInfo: LocalProjectSettings;

  /**
   * Creates an instance of ProjectLoader
   * @param projectId the id of the projct to load
   */
  constructor(
    private projectId: string
  ) { }

  public async loadProject(): Promise<void> {
    await this.setProjectInfoFromIndexedDB();
    await this.createNewInstanceOfDbConnectorForrProject();
    this.callCurrentProjectSetter();
  }

  /**
   * Loads project info from indexedDB
   */
  private async setProjectInfoFromIndexedDB() {
    this.projectInfo = await dbInstances.system.callSelector<LocalProjectSettings>(CLIENT_SECTIONS.projects, { id: this.projectId }).single();
  }

  /**
   * Creates new instance of dbConnector for the project so it can be used in the app
   */
  private async createNewInstanceOfDbConnectorForrProject() {
    dbInstances[this.projectId] = await new DbConnector(FILE_HANDLES_PLUGIN, { projectInfo: this.projectInfo }).init();
  }

  /**
   * Calls current project setter to load the current project in the Redux store
   */
  private callCurrentProjectSetter() {
    new CurrentProjectSetter(dbInstances[this.projectId].dbStore.db[RESERVED_UDS_KEYS._settings], dbInstances[this.projectId].dbStore.db[RESERVED_UDS_KEYS._sections]).set();
  }

}