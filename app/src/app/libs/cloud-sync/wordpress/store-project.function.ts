import { WordPressAuth } from 'app/libs/cloud-sync/wordpress/wordpress-auth.class'
import { WordPressSync } from 'app/libs/cloud-sync/wordpress/wordpress-sync.class'
import type { IWordPressPingResponse } from 'app/libs/cloud-sync/wordpress/wordpress.const'
import type { TStorageChoice } from 'app/components/remotes/storage-choice.component'

/**
 * Checks the site chosen in a "connect" storage choice before anything is saved. Throws with an explanation.
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
 * Stores a project saved on this device as chosen: links it to a connected site, or opens the login of a new site
 * (the browser leaves the app and the project is linked when the user comes back).
 */
export const storeProject = async (projectId: string, choice: TStorageChoice, checkedSite?: IWordPressPingResponse | null): Promise<void> => {
  if (choice.kind === 'remote') {
    await WordPressSync.linkProject(projectId, choice.remoteId, choice.accessLevel)
  } else if (choice.kind === 'connect') {
    const site = checkedSite ?? await checkSiteOfStorageChoice(choice)
    await WordPressAuth.startLogin(site!, { linkProjectId: projectId, linkAccessLevel: choice.accessLevel })
  }
}
