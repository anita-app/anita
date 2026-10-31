import { Manager } from 'app/cross-refs-exports'
import { DbInitializer } from 'app/data/local-dbs/db-initializer.class'
import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { CLIENT_SECTIONS } from 'app/data/system-local-db/client-sections.enum'
import { ProjectSaver } from 'app/models/project/project-saver.class'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { sortSections } from 'app/models/section/sort-sections.function'
import { Bucket } from 'app/state/bucket.state'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { ProjectsListAtoms } from 'app/state/projects-list/projects-list.atoms'
import type { IProjectSettings, LocalProjectSettings, TSystemData } from 'app/models/project/project.declarations'
import type { ISection } from 'app/models/section/section.declarations'

/**
 * Changes made on another device while a sync is running must not be considered older than the sync.
 * lastSync is therefore set to the start of the sync, minus this margin to absorb small clock differences.
 */
export const LAST_SYNC_SAFETY_MARGIN_MS = 2 * 60 * 1000

/**
 * Helpers shared by the syncs with WordPress and with Dropbox.
 */
export class ProjectSyncHelpers {
  public static syncStartTime = (): string => new Date(Date.now() - LAST_SYNC_SAFETY_MARGIN_MS).toISOString()

  public static getLocalProjects = (): Array<LocalProjectSettings> => Bucket.general.get(ProjectsListAtoms.projects) ?? []

  public static getLocalProjectSettings = (projectId: string): LocalProjectSettings | undefined => (
    ProjectSyncHelpers.getLocalProjects().find(project => project.id === projectId)
  )

  public static isCurrentProject = (projectId: string): boolean => Bucket.general.get(ProjectAtoms.currentProject)?.getId() === projectId

  /**
   * Settings of a local project as stored now, which the list of projects may not reflect yet.
   */
  public static getStoredProjectSettings = async (projectId: string): Promise<LocalProjectSettings | undefined> => (
    (await dbInstances.system.callSelector<LocalProjectSettings>(CLIENT_SECTIONS.projects, { id: projectId }).single()) || undefined
  )

  /**
   * Reads the settings and sections of any local project, loading its database if needed.
   */
  public static getSystemData = async (projectId: string): Promise<TSystemData | null> => {
    const info = await ProjectSyncHelpers.getStoredProjectSettings(projectId)
    if (!info) {
      return null
    }
    if (!dbInstances[projectId]) {
      await new DbInitializer(info).init()
    }
    const settings = await dbInstances[projectId].callSelector<IProjectSettings>(RESERVED_AUDS_KEYS._settings).multiple()
    const sections = sortSections(await dbInstances[projectId].callSelector<ISection>(RESERVED_AUDS_KEYS._sections).multiple())
    if (!settings?.length) {
      return null
    }
    return { [RESERVED_AUDS_KEYS._settings]: settings, [RESERVED_AUDS_KEYS._sections]: sections }
  }

  /**
   * Saves settings coming from a sync, without changing timestamps and without triggering another sync.
   * Keys set to undefined are removed.
   */
  public static saveSettingsSilently = async (projectId: string, changes: Partial<IProjectSettings>): Promise<void> => {
    const systemData = await ProjectSyncHelpers.getSystemData(projectId)
    if (!systemData) {
      return
    }
    const settings = { ...systemData[RESERVED_AUDS_KEYS._settings][0], ...changes }
    Object.keys(changes).forEach((key) => {
      if (changes[key as keyof IProjectSettings] === undefined) {
        delete settings[key as keyof IProjectSettings]
      }
    })
    const saved = await new ProjectSaver({ ...systemData, [RESERVED_AUDS_KEYS._settings]: [settings] }, EDITOR_MODE.edit, { fromSync: true }).save()
    if (ProjectSyncHelpers.isCurrentProject(projectId)) {
      Manager.setCurrentProject(saved)
    }
  }
}
