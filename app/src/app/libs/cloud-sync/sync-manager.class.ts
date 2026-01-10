import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { SupportedCloud } from 'app/cross-refs-exports'
import { CloudSyncState } from 'app/libs/cloud-sync/cloud-sync.const'
import { RemoteAndLocalMerger } from 'app/libs/cloud-sync/remote-and-local-merger.class'
import { WordpressHelper } from 'app/libs/cloud-sync/wordpress/wordpress-helper.class'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { SyncState } from 'app/state/sync/sync-state.class'
import { Bucket } from 'app/state/bucket.state'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import type { TSystemData } from 'app/models/project/project.declarations'
import type { ISectionElement } from 'app/models/section-element/section-element.declarations'

export interface ISyncWithRemoteOrLocalAddProjectProps {
  mode: EDITOR_MODE.add
  type: 'project'
  systemData: TSystemData
}

export interface ISyncWithRemoteOrLocalEditProjectProps {
  mode: EDITOR_MODE.edit
  type: 'project'
}

interface ISyncWithRemoteOrLocalDeleteProjectProps {
  mode: EDITOR_MODE.delete
  type: 'project'
  projectId: string
}

interface ISyncWithRemoteOrLocalAddOrEditElementSectionProps {
  mode: EDITOR_MODE.add | EDITOR_MODE.edit
  type: 'element'
  projectId: string
  sectionId: string
  elementId: string
  elementData: ISectionElement
}

interface ISyncWithRemoteOrLocalDeleteElementSectionProps {
  mode: EDITOR_MODE.delete
  type: 'element'
  projectId: string
  sectionId: string
  elementId: string
}

type ISyncWithRemoteOrLocalProps = ISyncWithRemoteOrLocalAddProjectProps | ISyncWithRemoteOrLocalEditProjectProps | ISyncWithRemoteOrLocalDeleteProjectProps | ISyncWithRemoteOrLocalAddOrEditElementSectionProps | ISyncWithRemoteOrLocalDeleteElementSectionProps

export class SyncManager {
  public static syncWithRemoteOrLocal = async (props: ISyncWithRemoteOrLocalProps): Promise<void> => {
    const [remoteId, type] = SyncManager.getRemoteIdAndType(props)
    // eslint-disable-next-line eqeqeq
    if (remoteId && type == SupportedCloud.WORDPRESS && props.mode === EDITOR_MODE.delete) {
      const projectIdForDelete = props.projectId
      const client = await WordpressHelper.instance.getClient(remoteId)
      if (client) {
        await client.deleteProject(projectIdForDelete)
      }
    // eslint-disable-next-line eqeqeq
    } else if (remoteId && type == SupportedCloud.WORDPRESS && props.type === 'element') {
      const client = await WordpressHelper.instance.getClient(remoteId)
      const projectIdForElement = props.projectId
      const sectionIdForElement = props.sectionId
      const elementIdForElement = props.elementId
      if (!client) {
        // TODO handle no client
      } else if (props.mode === EDITOR_MODE.delete) {
        await client.deleteSectionElement(projectIdForElement, sectionIdForElement, elementIdForElement)
      } else {
        const elementDataForElement = props.elementData
        await client.saveSectionElement(projectIdForElement, sectionIdForElement, elementIdForElement, elementDataForElement)
      }
    } else if (remoteId) {
      await this.handleRemoteSync(remoteId, type)
    }
    SyncState.setIsSavingInFs(false)
  }

  private static getRemoteIdAndType = (props: ISyncWithRemoteOrLocalProps): [string, SupportedCloud] | [null, null] => {
    if (Bucket.general.get(ProjectAtoms.currentProject)?.dropBoxSyncInfo.getLinkedFileId()) {
      const remoteId = Bucket.general.get(ProjectAtoms.currentProject)?.dropBoxSyncInfo.getLinkedFileId()!
      return [remoteId, SupportedCloud.DROPBOX]
    }
    const remoteIdForWordPress = this.getRemoteIdForWordPress(props)
    if (remoteIdForWordPress) {
      return [remoteIdForWordPress, SupportedCloud.WORDPRESS]
    }
    return [null, null]
  }

  private static getRemoteIdForWordPress = (props: ISyncWithRemoteOrLocalProps): string | undefined => {
    if (props.mode === EDITOR_MODE.add && props.type === 'project') {
      return props.systemData[RESERVED_AUDS_KEYS._settings][0].remoteStorage
    }
    return Bucket.general.get(ProjectAtoms.currentProject)?.getSettings().remoteStorage
  }

  private static handleRemoteSync = (remoteId: string, type: SupportedCloud): Promise<void> | undefined => {
    if (SyncManager.canStartSyncWithRemote()) {
      return new RemoteAndLocalMerger(remoteId, type).sync()
    }
  }

  private static canStartSyncWithRemote = (): boolean => (
    !SyncState.getIsSyncing() &&
    Bucket.general.get(ProjectAtoms.currentProject)?.dropBoxSyncInfo.getCloudSyncState() === CloudSyncState.LINKED &&
    !!Bucket.general.get(ProjectAtoms.currentProject)?.dropBoxSyncInfo.getLinkedFileId()
  )
}
