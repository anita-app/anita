import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { DropboxSync } from 'app/libs/cloud-sync/dropbox/dropbox-sync.class'
import { ProjectSyncHelpers } from 'app/libs/cloud-sync/project-sync-helpers.class'
import { WordPressSync } from 'app/libs/cloud-sync/wordpress/wordpress-sync.class'
import { SyncState } from 'app/state/sync/sync-state.class'
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
      if (props.type === 'project') {
        // Both are told: each one links, unlinks or syncs the project, also when it moves from one to the other.
        await DropboxSync.onProjectSaved(props.systemData)
        await WordPressSync.onProjectSaved(props.systemData)
      } else if (DropboxSync.isDropboxProject(ProjectSyncHelpers.getLocalProjectSettings(props.projectId))) {
        DropboxSync.pushLocalChange(props.projectId)
      } else if (WordPressSync.getRemoteIdOfProject(props.projectId)) {
        await SyncManager.syncElementWithWordPress(props)
      }
    } catch (error) {
      Logger.error('[SyncManager] sync failed', error as string)
    } finally {
      SyncState.setIsSavingInFs(false)
    }
  }

  private static syncElementWithWordPress = async (props: ISyncWithRemoteOrLocalAddOrEditElementSectionProps | ISyncWithRemoteOrLocalDeleteElementSectionProps): Promise<void> => {
    if (props.mode === EDITOR_MODE.delete) {
      await WordPressSync.pushElementDeletion(props.projectId, props.sectionId, props.elementId)
    } else {
      await WordPressSync.pushElement(props.projectId, props.sectionId, props.elementData)
    }
  }
}
