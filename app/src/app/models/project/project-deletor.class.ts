import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { CLIENT_SECTIONS } from 'app/data/system-local-db/client-sections.enum'
import { CloudSyncBase, SyncManager } from 'app/cross-refs-exports'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import type { IProjectSettings } from 'app/models/project/project.declarations'

/**
 * Deletes a project from the current device
 */
export class ProjectDeletor {
  /**
   * Creates an instance of project deletor.
   * @param projectSettings the settings of the project to delete
   */
  constructor (
    private projectId: string,
  ) { }

  /**
   * Deletes the project and reloads the list of projects
   */
  public async delete (): Promise<void> {
    await this.callOnProjectDeleted()
    this.deleteOnRemote()
    await this.doDelete()
    await CloudSyncBase.clearRemoteId(this.projectId)
    await CloudSyncBase.deleteLastSync(this.projectId)
  }

  /**
   * Performs the delete action on IndexedDB with db-connector
   */
  private async doDelete (): Promise<void> {
    await dbInstances.system.callDeletor<IProjectSettings>(CLIENT_SECTIONS.projects, { id: this.projectId }).autoDelete()
  }

  private deleteOnRemote () {
    SyncManager.syncWithRemoteOrLocal({ mode: EDITOR_MODE.delete, type: 'project', projectId: this.projectId })
  }

  private async callOnProjectDeleted (): Promise<void> {
    if (dbInstances[this.projectId]) {
      await dbInstances[this.projectId].dbStore.onProjectDeleted?.()
    }
  }
}
