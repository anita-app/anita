import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { CloudSyncBase, SupportedCloud } from 'app/cross-refs-exports'
import { CloudSyncTable } from 'app/libs/cloud-sync/cloud-sync.const'
import { WordPressClient } from 'app/libs/cloud-sync/wordpress/wordpress-client.class'
import { WORD_PRESS_ROLE_WEIGHT } from 'app/libs/cloud-sync/wordpress/wordpress.const'
import { ProjectDataImporter } from 'app/libs/projects-helpers/project-importers/project-data-importer.class'
import { ProjectDeletor } from 'app/models/project/project-deletor.class'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { Bucket } from 'app/state/bucket.state'
import { ModalState } from 'app/state/modal/modal-state.class'
import { ProjectsListAtoms } from 'app/state/projects-list/projects-list.atoms'
import { SyncStateAtoms } from 'app/state/sync/sync-state.atoms'
import { SyncState } from 'app/state/sync/sync-state.class'
import { liveQuery } from 'dexie'
import type { IWordPressRemoteInfo } from 'app/libs/cloud-sync/wordpress/wordpress.const'

/**
 * API reference: Anita Project Manager Wordpress plugin
 */

export interface IWordPressAuthData {
  access_token: string
  refresh_token: string
  remoteBaseUrl: string
}

export class WordpressHelper extends CloudSyncBase<SupportedCloud.WORDPRESS> {
  public static instance: WordpressHelper

  public static init (): WordpressHelper {
    WordpressHelper.instance = new WordpressHelper()
    return WordpressHelper.instance
  }

  constructor () {
    super(SupportedCloud.WORDPRESS)
    CloudSyncBase.initDB()
    this.watchRemotesChanges()
  }

  private watchRemotesChanges = () => {
    liveQuery(() => CloudSyncBase.getDB().table<IWordPressRemoteInfo>(CloudSyncTable.REMOTES_INFO).toArray())
      .subscribe((remotes) => {
        SyncState.setWordPressRemotes(remotes)
        const remoteIds = remotes.map(remote => remote.remoteId)
        Bucket.general.set(SyncStateAtoms.wordPressRemotesIds, remoteIds)
      })
  }

  public async getAccessTokenFromCode (code: string) {
    const unencodedData = atob(code)
    const authData: IWordPressAuthData = JSON.parse(unencodedData)
    if (authData.access_token && authData.refresh_token) {
      const cleanRemoteUrl = authData.remoteBaseUrl.replace('https://', '').replace('http://', '')
      this.storeDataForService(authData, cleanRemoteUrl)
      const remoteId = authData.remoteBaseUrl.replace(/(https?:\/\/)?(www\.)?/i, '').replace(/\/$/, '')
      const client = new WordPressClient(remoteId, authData)
      try {
        const res = await client.getSpaceInfo()
        if (res.statusText === 'OK') {
          this.saveRemoteInfo(remoteId, res.data)
        } else if (res?.statusText === 'rest_token_tampered') {
          ModalState.showModal({
            isOpen: true,
            title: 'Authentication error',
            hideCancelButton: true,
            type: Type.primary,
            children: `There is an issue with the your authentication data. Please re-authenticate on ${cleanRemoteUrl}.`,
            ctas: [{
              actionText: 'Open login page',
              handleClickAction: () => client.openLoginPage(),
            }],
          })
        }
      } catch (error: unknown) {
        console.error('Error getting space info:', error)
      }
    }
  }

  public async getClient (remoteId: string): Promise<WordPressClient | undefined> {
    const authData = await this.getDataForService(remoteId)
    if (!authData) {
      ModalState.showModal({
        isOpen: true,
        title: 'Authentication error',
        hideCancelButton: true,
        type: Type.primary,
        children: `There is an issue with the your authentication data. Please re-authenticate on ${remoteId}.`,
        ctas: [{
          actionText: 'Open login page',
          handleClickAction: () => window.open(`https://${remoteId}/index.php?anita_oauth=1`),
        }],
      })
      return
    }
    return new WordPressClient(remoteId, authData)
  }

  public async syncWithRemote (remoteId: string) {
    const client = await this.getClient(remoteId)
    if (!client) {
      return
    }
    const remoteProjects = (await client.getProjects()) || []
    const localProjects = Bucket.general.get(ProjectsListAtoms.projects)?.filter(project => project.remoteStorage === remoteId)
    const localProjectsIds = localProjects?.map(project => project.id)
    for (const remoteProject of remoteProjects) {
      if (!localProjectsIds?.includes(remoteProject[RESERVED_AUDS_KEYS._settings][0].id)) {
        new ProjectDataImporter(remoteProject).import()
      }
    }
    const remoteProjectsIds = remoteProjects.map(project => project[RESERVED_AUDS_KEYS._settings][0].id)
    for (const localProjectId of localProjectsIds) {
      if (remoteProjectsIds.includes(localProjectId)) {
        continue
      }
      new ProjectDeletor(localProjectId).delete()
    }
  }

  public canDeleteProject (remoteId: string): boolean {
    const remoteInfo = Bucket.general.get(SyncStateAtoms.remoteInfo[remoteId])
    if (!remoteInfo) {
      return false
    }
    const userRole = remoteInfo.data.user_role
    const userRoleWeight = WORD_PRESS_ROLE_WEIGHT[userRole]
    if (userRoleWeight >= WORD_PRESS_ROLE_WEIGHT.administrator) {
      return true
    }
    return false
  }
}
