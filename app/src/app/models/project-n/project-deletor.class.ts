import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { IProjectSettings } from 'app/models/project-n/project.declarations'
import { CLIENT_SECTIONS } from 'app/data/system-local-db/client-sections.enum'
import { ProjectsListLoader } from 'app/libs/projects-helpers/projects-handlers/projects-list-loader.class'

/**
 * Deletes a project from the current device
 */
export class ProjectDeletor {
  /**
   * Creates an instance of project deletor.
   * @param projectSettings the settings of the project to delete
   */
  constructor (
    private projectSettings: IProjectSettings
  ) { }

  /**
   * Deletes the project and reloads the list of projects
   */
  public async delete (): Promise<void> {
    await this.callOnProjectDeleted()
    await this.doDelete()
    this.reloadProjectList()
  }

  /**
   * Performs the delete action on IndexedDB with db-connector
   */
  private async doDelete (): Promise<void> {
    await dbInstances.system.callDeletor<IProjectSettings>(CLIENT_SECTIONS.projects, { id: this.projectSettings.id }).autoDelete()
  }

  private async callOnProjectDeleted (): Promise<void> {
    if (dbInstances[this.projectSettings.id]) {
      await dbInstances[this.projectSettings.id].dbStore.onProjectDeleted?.()
    }
  }

  /**
   * Reloads the project list from scratch
   */
  private reloadProjectList (): void {
    new ProjectsListLoader().load()
  }
}
