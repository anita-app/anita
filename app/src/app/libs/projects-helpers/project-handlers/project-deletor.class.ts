import { CLIENT_SECTIONS } from '@anita/client/data/client-sections.enum';
import { dbInstances } from '@anita/client/data/db-instances.const';
import { ProjectSettings } from '@anita/client/data/model/project-info';
import { ProjectsListLoader } from '@anita/client/libs/projects-helpers/projects-handlers/projects-list-loader.class';

/**
 * Deletes a project from the current device
 */
export class ProjectDeletor {

  /**
   * Creates an instance of project deletor.
   * @param project the settings of the project to delete
   */
  constructor(
    private project: ProjectSettings
  ) { }

  /**
   * Deletes the project and reloads the list of projects
   */
  public async delete(): Promise<void> {
    await this.doDelete();
    this.reloadProjectList();
  }

  /**
   * Performs the delete action on IndexedDB with db-connector
   */
  private async doDelete(): Promise<void> {
    await dbInstances.system.callDeletor<ProjectSettings>(CLIENT_SECTIONS.projects, { id: this.project.id }).autoDelete();
  }

  /**
   * Reloads the project list from scratch
   */
  private reloadProjectList(): void {
    new ProjectsListLoader().load();
  }

}
