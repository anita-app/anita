import { CloudSyncBase, Manager, SupportedCloud } from 'app/cross-refs-exports'
import { RemoteAndLocalMerger } from 'app/libs/cloud-sync/remote-and-local-merger.class'
import { WordpressHelper } from 'app/libs/cloud-sync/wordpress/wordpress-helper.class'
import { WordPressApiError, WordPressErrorCode, getWordPressErrorMessage } from 'app/libs/cloud-sync/wordpress/wordpress-api-error.class'
import { ACCESS_LEVEL_LABELS, DEFAULT_ACCESS_LEVEL } from 'app/libs/cloud-sync/wordpress/wordpress.const'
import { ProjectDataImporter } from 'app/libs/projects-helpers/project-importers/project-data-importer.class'
import { DbInitializer } from 'app/data/local-dbs/db-initializer.class'
import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { CLIENT_SECTIONS } from 'app/data/system-local-db/client-sections.enum'
import { Project } from 'app/models/project/project.class'
import { ProjectSaver } from 'app/models/project/project-saver.class'
import { ProjectDeletor } from 'app/models/project/project-deletor.class'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { ANITA_URLS } from 'app/libs/routing/anita-routes.constant'
import { Bucket } from 'app/state/bucket.state'
import { ModalState } from 'app/state/modal/modal-state.class'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { ProjectState } from 'app/state/project/project-state.class'
import { ProjectsListAtoms } from 'app/state/projects-list/projects-list.atoms'
import { RoutingState } from 'app/state/routing/routing-state.class'
import { SyncState } from 'app/state/sync/sync-state.class'
import { DateTools } from 'app/libs/tools/date-tools.class'
import type { ReactNode } from 'react'
import type { WordPressClient } from 'app/libs/cloud-sync/wordpress/wordpress-client.class'
import type { IRemoteProjectInfo, IWordPressProjectMeta, IWordPressSpaceInfo, TAccessLevel } from 'app/libs/cloud-sync/wordpress/wordpress.const'
import type { IProjectSettings, LocalProjectSettings, TSystemData } from 'app/models/project/project.declarations'
import type { ISection } from 'app/models/section/section.declarations'
import type { ISectionElement } from 'app/models/section-element/section-element.declarations'

const LAST_SYNC_SAFETY_MARGIN_MS = 2 * 60 * 1000

const syncStartTime = (): string => new Date(Date.now() - LAST_SYNC_SAFETY_MARGIN_MS).toISOString()

interface IModalChoice<T extends string> {
  value: T
  label: string
  type?: Type
}

const showPrompt = <T extends string>(title: string, children: ReactNode, choices: Array<IModalChoice<T>>, options: { hideCancelButton?: boolean } = {}): Promise<T | null> => (
  new Promise((resolve) => {
    ModalState.showModal({
      title,
      type: Type.primary,
      hideCancelButton: options.hideCancelButton,
      children,
      handleClickCancel: () => resolve(null),
      handleOnClose: () => {
        ModalState.hideModal()
        resolve(null)
      },
      ctas: choices.map(choice => ({
        actionText: choice.label,
        actionType: choice.type,
        handleClickAction: () => resolve(choice.value),
      })),
    })
  })
)

let promptQueue: Promise<unknown> = Promise.resolve()

/**
 * Shows a modal and resolves with the chosen action, or null if the user cancels.
 * Prompts are shown one at a time, so that two syncs never overwrite each other's question.
 */
const ask = <T extends string>(title: string, children: ReactNode, choices: Array<IModalChoice<T>>, options: { hideCancelButton?: boolean } = {}): Promise<T | null> => {
  const answer = promptQueue.then(() => showPrompt(title, children, choices, options))
  promptQueue = answer.catch(() => undefined)
  return answer
}

/**
 * Sync between the projects on this device and the WordPress sites they are linked to.
 *
 * - Site level (`syncRemote`): imports the projects of the site that are not on this device, uploads linked projects
 *   that were never uploaded, and applies the policy for projects that disappeared from the site.
 * - Project level (`syncProject`): two-way merge of the current project.
 * - Single records are sent as soon as they are saved (`pushElement`, `pushElementDeletion`); if that fails, the next
 *   merge sends them.
 */
export class WordPressSync {
  private static remoteRuns: Record<string, Promise<void> | undefined> = {}
  private static projectRuns: Record<string, Promise<void> | undefined> = {}
  /** Projects being linked: the link uploads them, other syncs must not. */
  private static linking = new Set<string>()
  /** Missing projects the user already decided not to handle in this session, or is being asked about. */
  private static postponedMissingProjects = new Set<string>()

  // ---------------------------------------------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------------------------------------------

  public static getLocalProjectSettings (projectId: string): LocalProjectSettings | undefined {
    return Bucket.general.get(ProjectsListAtoms.projects)?.find(project => project.id === projectId)
  }

  public static getRemoteIdOfProject (projectId: string): string | undefined {
    return WordPressSync.getLocalProjectSettings(projectId)?.remoteStorage || undefined
  }

  private static isCurrentProject (projectId: string): boolean {
    return Bucket.general.get(ProjectAtoms.currentProject)?.getId() === projectId
  }

  private static async saveMeta (remoteId: string, meta: IWordPressProjectMeta): Promise<IRemoteProjectInfo> {
    const info: IRemoteProjectInfo = {
      projectId: meta.id,
      remoteId,
      ownerId: meta.owner_id,
      accessLevel: meta.access_level,
      canManage: meta.can_manage,
      lastModified: meta.last_modified,
    }
    await CloudSyncBase.saveRemoteProjectInfo(info)
    return info
  }

  /**
   * Reads the settings and sections of any local project, loading its database if needed.
   */
  private static async getSystemData (projectId: string): Promise<TSystemData | null> {
    const info = await dbInstances.system.callSelector<LocalProjectSettings>(CLIENT_SECTIONS.projects, { id: projectId }).single()
    if (!info) {
      return null
    }
    if (!dbInstances[projectId]) {
      await new DbInitializer(info).init()
    }
    const settings = await dbInstances[projectId].callSelector<IProjectSettings>(RESERVED_AUDS_KEYS._settings).multiple()
    const sections = await dbInstances[projectId].callSelector<ISection>(RESERVED_AUDS_KEYS._sections).multiple()
    if (!settings?.length) {
      return null
    }
    return { [RESERVED_AUDS_KEYS._settings]: settings, [RESERVED_AUDS_KEYS._sections]: sections }
  }

  /**
   * Saves settings coming from a sync, without changing timestamps and without triggering another sync.
   */
  private static async saveSettingsSilently (projectId: string, changes: Partial<IProjectSettings>): Promise<void> {
    const systemData = await WordPressSync.getSystemData(projectId)
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
    if (WordPressSync.isCurrentProject(projectId)) {
      Manager.setCurrentProject(saved)
    }
  }

  private static reportProjectError (projectId: string, remoteId: string, error: unknown): void {
    const apiError = WordPressApiError.from(error)
    SyncState.updateProjectStatus(projectId, {
      isSyncing: false,
      pendingChanges: true,
      error: getWordPressErrorMessage(apiError, WordpressHelper.instance.getRemoteName(remoteId)),
    })
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Site level
  // ---------------------------------------------------------------------------------------------------------------

  /**
   * Syncs the list of projects of a site. Concurrent calls share the same run.
   */
  public static syncRemote (remoteId: string): Promise<void> {
    if (!WordPressSync.remoteRuns[remoteId]) {
      WordPressSync.remoteRuns[remoteId] = WordPressSync.doSyncRemote(remoteId).finally(() => {
        WordPressSync.remoteRuns[remoteId] = undefined
      })
    }
    return WordPressSync.remoteRuns[remoteId]!
  }

  private static async doSyncRemote (remoteId: string): Promise<void> {
    SyncState.updateRemoteStatus(remoteId, { isSyncing: true })
    try {
      const client = await WordpressHelper.instance.getClient(remoteId)
      const spaceInfo = await WordpressHelper.instance.refreshSpaceInfo(remoteId)
      const index = await client.getProjectsIndex()
      const remoteIds = new Set(index.map(meta => meta.id))
      const localProjects = Bucket.general.get(ProjectsListAtoms.projects) ?? []
      const localIds = new Set(localProjects.map(project => project.id))
      const known = new Map((await CloudSyncBase.getRemoteProjectsInfo(remoteId)).map(info => [info.projectId, info]))

      for (const meta of index) {
        if (!localIds.has(meta.id)) {
          await WordPressSync.importProject(client, remoteId, meta.id)
        } else if (localProjects.find(project => project.id === meta.id)?.remoteStorage === remoteId) {
          // A local copy linked to another site, or not linked, keeps its own sync data.
          await WordPressSync.saveMeta(remoteId, meta)
        }
      }

      const linkedNotOnRemote = localProjects.filter(project => project.remoteStorage === remoteId && !remoteIds.has(project.id))
      const neverUploaded = linkedNotOnRemote.filter(project => !known.has(project.id) && !WordPressSync.linking.has(project.id))
      const missing = linkedNotOnRemote.filter(project => known.has(project.id))

      for (const project of neverUploaded) {
        try {
          await WordPressSync.uploadProject(client, remoteId, project.id)
        } catch (error) {
          WordPressSync.reportProjectError(project.id, remoteId, error)
        }
      }

      SyncState.updateRemoteStatus(remoteId, { isSyncing: false, error: undefined, lastSync: DateTools.getUtcIsoString() })

      // Not awaited: the questions must not keep this site's sync running.
      WordPressSync.handleMissingProjects(remoteId, spaceInfo, missing, known)
    } catch (error) {
      const apiError = WordPressApiError.from(error)
      SyncState.updateRemoteStatus(remoteId, { isSyncing: false, error: getWordPressErrorMessage(apiError, WordpressHelper.instance.getRemoteName(remoteId)) })
    }
  }

  private static async importProject (client: WordPressClient, remoteId: string, projectId: string): Promise<void> {
    const startedAt = syncStartTime()
    const remote = await client.getProjectById(projectId)
    if (!remote) {
      return
    }
    const settings = remote.project[RESERVED_AUDS_KEYS._settings][0]
    settings.remoteStorage = remoteId
    settings.remoteAccessLevel = remote.meta.access_level
    await new ProjectDataImporter(remote.project).import()
    await WordPressSync.saveMeta(remoteId, remote.meta)
    await WordpressHelper.instance.setLastSync(projectId, startedAt)
  }

  /**
   * Uploads a whole local project: settings and sections, then all records in batches.
   */
  private static async uploadProject (client: WordPressClient, remoteId: string, projectId: string, accessLevel?: TAccessLevel): Promise<void> {
    const startedAt = syncStartTime()
    const systemData = await WordPressSync.getSystemData(projectId)
    if (!systemData) {
      return
    }
    const settings = systemData[RESERVED_AUDS_KEYS._settings][0]
    const level = accessLevel ?? settings.remoteAccessLevel ?? DEFAULT_ACCESS_LEVEL
    const allData = await new Project(systemData).getAllData()

    const meta = await client.saveProject(systemData, { accessLevel: level })

    const operations = Object.keys(allData)
      .filter(key => key !== RESERVED_AUDS_KEYS._settings && key !== RESERVED_AUDS_KEYS._sections)
      .flatMap(sectionId => (allData[sectionId] ?? []).map((element: ISectionElement) => ({
        action: 'upsert' as const,
        sectionId,
        elementId: element.id!,
        element,
      })))
    const failures = await RemoteAndLocalMerger.sendOperations(client, projectId, operations)
    if (failures.length) {
      throw failures[0].error
    }

    await WordPressSync.saveMeta(remoteId, meta)
    await WordpressHelper.instance.setLastSync(projectId, startedAt)
    SyncState.updateProjectStatus(projectId, { isSyncing: false, error: undefined, pendingChanges: false, lastSync: DateTools.getUtcIsoString() })
  }

  /**
   * Projects that were on the site and are no longer returned: deleted on the site or no longer shared with the user.
   * Projects owned by someone else are removed from this device. For their own projects, users decide.
   */
  private static async handleMissingProjects (remoteId: string, spaceInfo: IWordPressSpaceInfo, missing: Array<LocalProjectSettings>, known: Map<string, IRemoteProjectInfo>): Promise<void> {
    const siteName = spaceInfo.site_name
    let ownedBySomeoneElse = missing.filter(project => {
      const ownerId = known.get(project.id)?.ownerId
      return !!ownerId && ownerId !== spaceInfo.user_id
    })
    const own = missing.filter(project => !ownedBySomeoneElse.includes(project))
    // A concurrent sync of the same site may be handling them already.
    ownedBySomeoneElse = ownedBySomeoneElse.filter(project => !WordPressSync.postponedMissingProjects.has(project.id))
    ownedBySomeoneElse.forEach(project => WordPressSync.postponedMissingProjects.add(project.id))

    for (const project of ownedBySomeoneElse) {
      await WordPressSync.removeLocalCopy(project.id)
    }
    if (ownedBySomeoneElse.length) {
      await ask(
        `Projects removed from ${siteName}`,
        (
          <div className="text-sm text-gray-600">
            <p>These projects were deleted on {siteName}, or their owner stopped sharing them with you. They have been removed from this device:</p>
            <ul className="list-disc ml-5 mt-2">
              {ownedBySomeoneElse.map(project => <li key={project.id}>{project.title}</li>)}
            </ul>
          </div>
        ),
        [{ value: 'ok', label: 'OK' }],
        { hideCancelButton: true },
      )
    }

    for (const project of own) {
      if (WordPressSync.postponedMissingProjects.has(project.id)) {
        continue
      }
      WordPressSync.postponedMissingProjects.add(project.id)
      const choices: Array<IModalChoice<'keep' | 'upload' | 'delete'>> = [
        { value: 'keep', label: 'Keep on this device only', type: Type.secondary },
      ]
      if (spaceInfo.can_create_projects) {
        choices.push({ value: 'upload', label: `Upload again to ${siteName}`, type: Type.secondary })
      }
      choices.push({ value: 'delete', label: 'Delete from this device', type: Type.danger })

      const choice = await ask(
        `"${project.title}" is no longer on ${siteName}`,
        (
          <div className="text-sm text-gray-600">
            <p>You created this project, but {siteName} no longer has it: it may have been deleted from another device or by an administrator of the site.</p>
            <p className="mt-2">The copy on this device has not been deleted. What do you want to do?</p>
          </div>
        ),
        choices,
      )

      if (choice) {
        WordPressSync.postponedMissingProjects.delete(project.id)
      }
      if (choice === 'delete') {
        await WordPressSync.removeLocalCopy(project.id)
      } else if (choice === 'keep') {
        await WordPressSync.unlinkProject(project.id)
      } else if (choice === 'upload') {
        await CloudSyncBase.deleteRemoteProjectInfo(project.id)
        try {
          await WordPressSync.uploadProject(await WordpressHelper.instance.getClient(remoteId), remoteId, project.id)
        } catch (error) {
          WordPressSync.reportProjectError(project.id, remoteId, error)
        }
      }
    }
  }

  /**
   * Deletes a project from this device only.
   */
  public static async removeLocalCopy (projectId: string): Promise<void> {
    if (WordPressSync.isCurrentProject(projectId)) {
      ProjectState.resetCurrentProject()
      // Without view transition: this can happen while the user is navigating.
      RoutingState.navigate(ANITA_URLS.projectsList)
    }
    await new ProjectDeletor(projectId).delete({ deleteOnRemote: false })
    await CloudSyncBase.deleteRemoteProjectInfo(projectId)
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Linking
  // ---------------------------------------------------------------------------------------------------------------

  /**
   * Connects a local project to a site. First-sync policy: the project is uploaded, then all the projects of the site
   * are imported on this device. Other local projects are not uploaded.
   */
  public static async linkProject (projectId: string, remoteId: string, accessLevel?: TAccessLevel): Promise<void> {
    SyncState.updateProjectStatus(projectId, { isSyncing: true, error: undefined })
    WordPressSync.linking.add(projectId)
    let mergeAfterLink = false
    try {
      const client = await WordpressHelper.instance.getClient(remoteId)
      const settings = (await WordPressSync.getSystemData(projectId))?.[RESERVED_AUDS_KEYS._settings][0]
      if (settings && (settings.remoteStorage !== remoteId || (accessLevel && settings.remoteAccessLevel !== accessLevel))) {
        await WordPressSync.saveSettingsSilently(projectId, { remoteStorage: remoteId, remoteAccessLevel: accessLevel ?? settings?.remoteAccessLevel ?? DEFAULT_ACCESS_LEVEL })
      }
      const existing = await client.getProjectById(projectId)
      if (existing) {
        // Already on the site (re-linked, or imported from a file): merge instead of overwriting the site's data.
        await WordPressSync.saveMeta(remoteId, existing.meta)
        await CloudSyncBase.deleteLastSync(projectId)
        mergeAfterLink = true
      } else {
        await WordPressSync.uploadProject(client, remoteId, projectId, accessLevel)
      }
    } catch (error) {
      WordPressSync.reportProjectError(projectId, remoteId, error)
      throw error
    } finally {
      WordPressSync.linking.delete(projectId)
    }
    if (mergeAfterLink) {
      await WordPressSync.syncProject(projectId)
    }
    await WordPressSync.syncRemote(remoteId)
  }

  /**
   * Stops syncing a project. Its data stays on this device and on the site.
   */
  public static async unlinkProject (projectId: string): Promise<void> {
    await WordPressSync.saveSettingsSilently(projectId, { remoteStorage: undefined, remoteAccessLevel: undefined })
    await WordPressSync.forgetSyncData(projectId)
  }

  /**
   * Removes a site from this device. Its projects are kept as local projects, or deleted from this device.
   * Nothing is deleted on the site.
   */
  public static async disconnectRemote (remoteId: string, options: { deleteLocalProjects: boolean }): Promise<void> {
    const projects = (Bucket.general.get(ProjectsListAtoms.projects) ?? []).filter(project => project.remoteStorage === remoteId)
    for (const project of projects) {
      if (options.deleteLocalProjects) {
        await WordPressSync.removeLocalCopy(project.id)
      } else {
        await WordPressSync.unlinkProject(project.id)
      }
    }
    for (const info of await CloudSyncBase.getRemoteProjectsInfo(remoteId)) {
      await CloudSyncBase.deleteRemoteProjectInfo(info.projectId)
    }
    await WordpressHelper.instance.forgetRemote(remoteId)
  }

  private static async forgetSyncData (projectId: string): Promise<void> {
    await CloudSyncBase.deleteRemoteProjectInfo(projectId)
    await CloudSyncBase.deleteLastSync(projectId)
    SyncState.updateProjectStatus(projectId, { isSyncing: false, error: undefined, pendingChanges: false, lastSync: undefined, notice: undefined })
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Project level
  // ---------------------------------------------------------------------------------------------------------------

  /**
   * Two-way merge of the current project with the site. Concurrent calls share the same run.
   */
  public static syncProject (projectId: string): Promise<void> {
    if (!WordPressSync.projectRuns[projectId]) {
      WordPressSync.projectRuns[projectId] = WordPressSync.doSyncProject(projectId).finally(() => {
        WordPressSync.projectRuns[projectId] = undefined
      })
    }
    return WordPressSync.projectRuns[projectId]!
  }

  private static async doSyncProject (projectId: string): Promise<void> {
    const remoteId = WordPressSync.getRemoteIdOfProject(projectId)
    const project = Bucket.general.get(ProjectAtoms.currentProject)
    if (!remoteId || !project || project.getId() !== projectId || WordPressSync.linking.has(projectId)) {
      return
    }
    SyncState.updateProjectStatus(projectId, { isSyncing: true })
    try {
      const client = await WordpressHelper.instance.getClient(remoteId)
      const remote = await client.getProjectById(projectId)
      if (!remote) {
        SyncState.updateProjectStatus(projectId, { isSyncing: false })
        // Never uploaded, or no longer on the site: handled at site level.
        await WordPressSync.syncRemote(remoteId)
        return
      }
      await WordPressSync.saveMeta(remoteId, remote.meta)
      const outcome = await new RemoteAndLocalMerger(remoteId, SupportedCloud.WORDPRESS, project, { client, remote }).sync()
      if (outcome?.meta) {
        await WordPressSync.saveMeta(remoteId, outcome.meta)
      }
      const siteName = WordpressHelper.instance.getRemoteName(remoteId)
      SyncState.updateProjectStatus(projectId, {
        isSyncing: false,
        error: undefined,
        pendingChanges: false,
        lastSync: DateTools.getUtcIsoString(),
        notice: outcome?.conflicts
          ? `${outcome.conflicts} ${outcome.conflicts === 1 ? 'record was' : 'records were'} changed both on this device and on ${siteName} since the last sync. The most recent version was kept.`
          : undefined,
      })
    } catch (error) {
      WordPressSync.reportProjectError(projectId, remoteId, error)
    }
  }

  /**
   * Syncs the current project if the site has changes newer than the last sync, or if local changes are pending.
   */
  public static async syncCurrentProjectIfNeeded (): Promise<void> {
    const projectId = Bucket.general.get(ProjectAtoms.currentProject)?.getId()
    const remoteId = projectId ? WordPressSync.getRemoteIdOfProject(projectId) : undefined
    if (!projectId || !remoteId || SyncState.getWordPressRemote(remoteId)?.needsReauth) {
      return
    }
    if (SyncState.getProjectStatus(projectId)?.pendingChanges) {
      return WordPressSync.syncProject(projectId)
    }
    try {
      const client = await WordpressHelper.instance.getClient(remoteId)
      const meta = (await client.getProjectsIndex()).find(entry => entry.id === projectId)
      const lastSync = await CloudSyncBase.getLastSync(projectId)
      if (!meta || !lastSync || !meta.last_modified || DateTools.firstIsAfterSecond(meta.last_modified, lastSync)) {
        await WordPressSync.syncProject(projectId)
      }
    } catch (error) {
      WordPressSync.reportProjectError(projectId, remoteId, error)
    }
  }

  /**
   * Called after a project is created or edited on this device.
   */
  public static async onProjectSaved (systemData: TSystemData): Promise<void> {
    const settings = systemData[RESERVED_AUDS_KEYS._settings][0]
    const projectId = settings.id
    const remoteId = settings.remoteStorage
    const known = await CloudSyncBase.getRemoteProjectInfo(projectId)

    if (!remoteId) {
      if (known) {
        await WordPressSync.forgetSyncData(projectId)
      }
      return
    }

    if (!known || known.remoteId !== remoteId) {
      await WordPressSync.linkProject(projectId, remoteId, settings.remoteAccessLevel).catch(() => undefined)
      return
    }

    // The merge sends the new structure, keeping sections added on the site since the last sync.
    // A project that is not open is merged when it is opened.
    SyncState.updateProjectStatus(projectId, { pendingChanges: true })
    await WordPressSync.syncProject(projectId)
  }

  /**
   * Deletes a project from its site. Throws if the site refuses or cannot be reached, so that the local copy is kept.
   */
  public static async deleteRemoteProject (projectId: string): Promise<void> {
    const remoteId = WordPressSync.getRemoteIdOfProject(projectId)
    const known = await CloudSyncBase.getRemoteProjectInfo(projectId)
    if (!remoteId || !known) {
      return
    }
    if (!known.canManage) {
      throw new WordPressApiError(WordPressErrorCode.forbidden, 'Only the owner of the project or an administrator of the site can delete it.')
    }
    const client = await WordpressHelper.instance.getClient(remoteId)
    try {
      await client.deleteProject(projectId)
    } catch (error) {
      if (!(error instanceof WordPressApiError) || error.code !== WordPressErrorCode.notFound) {
        throw error
      }
    }
    await CloudSyncBase.deleteRemoteProjectInfo(projectId)
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Records
  // ---------------------------------------------------------------------------------------------------------------

  public static async pushElement (projectId: string, sectionId: string, element: ISectionElement): Promise<void> {
    await WordPressSync.pushElementChange(projectId, client => client.saveSectionElement(projectId, sectionId, element.id!, element))
  }

  public static async pushElementDeletion (projectId: string, sectionId: string, elementId: string): Promise<void> {
    await WordPressSync.pushElementChange(projectId, client => client.deleteSectionElement(projectId, sectionId, elementId))
  }

  private static async pushElementChange (projectId: string, send: (client: WordPressClient) => Promise<void>): Promise<void> {
    const remoteId = WordPressSync.getRemoteIdOfProject(projectId)
    if (!remoteId) {
      return
    }
    if (!(await CloudSyncBase.getRemoteProjectInfo(projectId))) {
      // Not uploaded yet: the upload will include this change.
      WordPressSync.syncRemote(remoteId)
      return
    }
    try {
      await send(await WordpressHelper.instance.getClient(remoteId))
    } catch (error) {
      WordPressSync.reportProjectError(projectId, remoteId, error)
    }
  }

  public static describeAccessLevel (accessLevel: TAccessLevel | undefined): string {
    return ACCESS_LEVEL_LABELS[accessLevel ?? DEFAULT_ACCESS_LEVEL]
  }
}
