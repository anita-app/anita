import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { CLIENT_SECTIONS } from 'app/data/system-local-db/client-sections.enum'
import { CloudSyncBase } from 'app/cross-refs-exports'
import { WordPressSync } from 'app/libs/cloud-sync/wordpress/wordpress-sync.class'
import { DropboxSync } from 'app/libs/cloud-sync/dropbox/dropbox-sync.class'
import type { IProjectSettings } from 'app/models/project/project.declarations'

interface IProjectDeletorOptions {
  /**
   * Also delete the project from the WordPress site it is synced with, or move its file to the deleted files of
   * Dropbox. If that fails, the local copy is kept.
   * Default true.
   */
  deleteOnRemote?: boolean
}

/**
 * Deletes a project from the current device
 *
 * @feature project.delete
 * @title Delete a project
 * @summary Removes a project and all its records from this device and, if it is synced, from Dropbox or from the WordPress site.
 * @where "Delete Project" button on the card of the project (Projects screen).
 * @usage 1. Click "Delete Project".
 * 2. Read the confirmation and click "Delete".
 * @options none
 * @rules The confirmation says what happens: for a project only on this device, all its data is removed from this device and
 * copies on other devices are not affected; for Dropbox, its file is moved to the deleted files of your Dropbox (where
 * it can be restored for a while) and your other devices ask what to do with their copy; for WordPress, it is deleted
 * from the site and from this device, for every user it is shared with. On WordPress only the owner of the project and
 * the administrators of the site see the button. If the deletion on Dropbox or WordPress fails, "The project was not
 * deleted" explains why and the project is kept on this device. It cannot be undone. Afterwards the Projects list opens.
 * @errors wordpress.forbidden, wordpress.network, dropbox.network, dropbox.authFailed
 * @status stable
 * @since 0.1.0
 * @related project.list, export.project
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
      await DropboxSync.deleteRemoteProject(this.projectId)
      await WordPressSync.deleteRemoteProject(this.projectId)
    }
    await this.callOnProjectDeleted()
    await this.doDelete()
    await CloudSyncBase.deleteDropboxLink(this.projectId)
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
