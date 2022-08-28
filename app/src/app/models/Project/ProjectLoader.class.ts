import { DbInitializer } from 'app/data/local-dbs/db-initializer.class'
import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import {
  LocalProjectSettings,
  IProjectSettings,
  RESERVED_AUDS_KEYS,
  ISection
} from 'app/data/project-structure/project-info'
import { CLIENT_SECTIONS } from 'app/data/system-local-db/client-sections.enum'
import { Manager } from 'app/libs/Manager/Manager.class'

export class ProjectLoader {
  /**
   * The project info of the project to load
   */
  private projectSettings: Array<IProjectSettings>
  private projectSections: Array<ISection>

  /**
   * Creates an instance of ProjectLoader
   * @param projectId the id of the projct to load
   */
  constructor (
    private projectId: string,
    private projectInfo?: LocalProjectSettings
  ) { }

  public async loadProject (): Promise<void> {
    if (!this.projectInfo) {
      await this.setProjectInfoFromIndexedDB()
    }
    await this.createNewInstanceOfDbConnectorForrProject()
    await this.loadProjectSettings()
    await this.loadProjectSections()
    this.callCurrentProjectSetter()
  }

  /**
   * Loads project info from indexedDB
   */
  private async setProjectInfoFromIndexedDB () {
    this.projectInfo = await dbInstances.system.callSelector<LocalProjectSettings>(CLIENT_SECTIONS.projects, { id: this.projectId }).single()
  }

  /**
   * Creates new instance of dbConnector for the project so it can be used in the app
   */
  private async createNewInstanceOfDbConnectorForrProject () {
    await new DbInitializer(this.projectInfo).init()
  }

  /**
   * Loads project settings from the dbInstance
   */
  public async loadProjectSettings (): Promise<void> {
    this.projectSettings = await dbInstances[this.projectId].callSelector<IProjectSettings>(RESERVED_AUDS_KEYS._settings).multiple()
  }

  /**
   * Loads project sections from the dbInstance
   */
  public async loadProjectSections (): Promise<void> {
    this.projectSections = await dbInstances[this.projectId].callSelector<ISection>(RESERVED_AUDS_KEYS._sections).multiple()
  }

  /**
   * Calls current project setter to load the current project in the Redux store
   */
  private callCurrentProjectSetter () {
    Manager.setCurrentProject({
      [RESERVED_AUDS_KEYS._settings]: this.projectSettings,
      [RESERVED_AUDS_KEYS._sections]: this.projectSections
    })
  }
}