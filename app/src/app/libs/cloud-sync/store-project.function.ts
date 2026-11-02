import { WordPressAuth } from 'app/libs/cloud-sync/wordpress/wordpress-auth.class'
import { WordPressSync } from 'app/libs/cloud-sync/wordpress/wordpress-sync.class'
import { DropboxHelper } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'
import { DropboxSync } from 'app/libs/cloud-sync/dropbox/dropbox-sync.class'
import { LocalFileSync } from 'app/libs/cloud-sync/local-file/local-file-sync.class'
import type { IWordPressPingResponse } from 'app/libs/cloud-sync/wordpress/wordpress.const'
import type { TStorageChoice } from 'app/components/remotes/storage-choice.component'

/**
 * Whether storing a project as chosen leaves the app to log in (to a new WordPress site, or to Dropbox).
 * @featurePart storage.choice
 */
export const storageChoiceNeedsLogin = (choice: TStorageChoice): boolean => (
  choice.kind === 'connect' || (choice.kind === 'dropbox' && !DropboxHelper.instance.isConnected())
)

/**
 * Checks the site chosen in a "connect" storage choice before anything is saved. Throws with an explanation.
 * @featurePart storage.choice
 */
export const checkSiteOfStorageChoice = async (choice: TStorageChoice): Promise<IWordPressPingResponse | null> => {
  if (choice.kind !== 'connect') {
    return null
  }
  if (!choice.siteUrl.trim()) {
    throw new Error('Enter the address of your WordPress site, for example https://example.com')
  }
  return WordPressAuth.checkSite(choice.siteUrl)
}

/**
 * Stores a project saved on this device as chosen: links it to a connected site or to Dropbox, or opens the login of
 * a new site or of Dropbox (the browser leaves the app and the project is linked when the user comes back).
 * @featurePart storage.choice
 */
export const storeProject = async (projectId: string, choice: TStorageChoice, checkedSite?: IWordPressPingResponse | null): Promise<void> => {
  if (choice.kind === 'remote') {
    await WordPressSync.linkProject(projectId, choice.remoteId, choice.accessLevel)
  } else if (choice.kind === 'connect') {
    const site = checkedSite ?? await checkSiteOfStorageChoice(choice)
    await WordPressAuth.startLogin(site!, { linkProjectId: projectId, linkAccessLevel: choice.accessLevel })
  } else if (choice.kind === 'localFile') {
    await LocalFileSync.linkProject(projectId, choice.handle, { overwrite: true })
  } else if (choice.kind === 'dropbox') {
    if (DropboxHelper.instance.isConnected()) {
      await DropboxSync.linkProject(projectId, { folder: choice.folder })
    } else {
      await DropboxHelper.instance.startLogin({ linkProjectId: projectId })
    }
  }
}
