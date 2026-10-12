import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { SupportedCloud } from 'app/cross-refs-exports'
import { CloudSyncState } from 'app/libs/cloud-sync/cloud-sync.const'
import { RemoteAndLocalMerger } from 'app/libs/cloud-sync/remote-and-local-merger.class'
import { WordPressSync } from 'app/libs/cloud-sync/wordpress/wordpress-sync.class'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { SyncState } from 'app/state/sync/sync-state.class'
import { Bucket } from 'app/state/bucket.state'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { Logger } from 'app/libs/logger/logger.class'
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
  systemData: TSystemData
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

type ISyncWithRemoteOrLocalProps = ISyncWithRemoteOrLocalAddProjectProps | ISyncWithRemoteOrLocalEditProjectProps | ISyncWithRemoteOrLocalAddOrEditElementSectionProps | ISyncWithRemoteOrLocalDeleteElementSectionProps

/**
 * Sends local changes to the remote copy of the project, if any: a Dropbox file or a WordPress site.
 * Project deletion is handled by ProjectDeletor, which must know whether the remote deletion succeeded.
 */
export class SyncManager {
  public static syncWithRemoteOrLocal = async (props: ISyncWithRemoteOrLocalProps): Promise<void> => {
    try {
      const dropboxFileId = SyncManager.getDropboxFileId(props)
      if (dropboxFileId) {
        await SyncManager.syncWithDropbox(dropboxFileId)
      } else if (props.type === 'project' || WordPressSync.getRemoteIdOfProject(props.projectId)) {
        // Project saves always go through WordPressSync, which also handles projects being linked or unlinked.
        await SyncManager.syncWithWordPress(props)
      }
    } catch (error) {
      Logger.error('[SyncManager] sync failed', error as string)
    } finally {
      SyncState.setIsSavingInFs(false)
    }
  }

  /**
   * Dropbox sync applies to the current project only, when it is linked to a Dropbox file.
   */
  private static getDropboxFileId = (props: ISyncWithRemoteOrLocalProps): string | null => {
    const project = Bucket.general.get(ProjectAtoms.currentProject)
    const projectId = props.type === 'project' ? props.systemData[RESERVED_AUDS_KEYS._settings][0].id : props.projectId
    if (!project || project.getId() !== projectId) {
      return null
    }
    const fileId = project.dropBoxSyncInfo.getLinkedFileId()
    return fileId && project.dropBoxSyncInfo.getCloudSyncState() === CloudSyncState.LINKED ? fileId : null
  }

  private static syncWithDropbox = async (fileId: string): Promise<void> => {
    if (!SyncState.getIsSyncing()) {
      await new RemoteAndLocalMerger(fileId, SupportedCloud.DROPBOX).sync()
    }
  }

  private static syncWithWordPress = async (props: ISyncWithRemoteOrLocalProps): Promise<void> => {
    if (props.type === 'project') {
      await WordPressSync.onProjectSaved(props.systemData)
    } else if (props.mode === EDITOR_MODE.delete) {
      await WordPressSync.pushElementDeletion(props.projectId, props.sectionId, props.elementId)
    } else {
      await WordPressSync.pushElement(props.projectId, props.sectionId, props.elementData)
    }
  }
}
