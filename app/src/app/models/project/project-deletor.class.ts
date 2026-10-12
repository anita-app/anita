import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { CLIENT_SECTIONS } from 'app/data/system-local-db/client-sections.enum'
import { CloudSyncBase } from 'app/cross-refs-exports'
import { WordPressSync } from 'app/libs/cloud-sync/wordpress/wordpress-sync.class'
import type { IProjectSettings } from 'app/models/project/project.declarations'

interface IProjectDeletorOptions {
  /**
   * Also delete the project from the WordPress site it is synced with. If that fails, the local copy is kept.
   * Default true.
   */
  deleteOnRemote?: boolean
}

/**
 * Deletes a project from the current device
 */
export class ProjectDeletor {
  /**
   * Creates an instance of project deletor.
   * @param projectId the id of the project to delete
   */
  constructor (
    private projectId: string,
  ) { }

  /**
   * Deletes the project and reloads the list of projects
   */
  public async delete (options: IProjectDeletorOptions = {}): Promise<void> {
    if (options.deleteOnRemote !== false) {
      await WordPressSync.deleteRemoteProject(this.projectId)
    }
    await this.callOnProjectDeleted()
    await this.doDelete()
    await CloudSyncBase.clearRemoteId(this.projectId)
    await CloudSyncBase.deleteLastSync(this.projectId)
    await CloudSyncBase.deleteRemoteProjectInfo(this.projectId)
    delete dbInstances[this.projectId]
  }

  /**
   * Performs the delete action on IndexedDB with db-connector
   */
  private async doDelete (): Promise<void> {
    await dbInstances.system.callDeletor<IProjectSettings>(CLIENT_SECTIONS.projects, { id: this.projectId }).autoDelete()
  }

  private async callOnProjectDeleted (): Promise<void> {
    if (dbInstances[this.projectId]) {
      await dbInstances[this.projectId].dbStore.onProjectDeleted?.()
    }
  }
}
