import { CloudSyncBase, SupportedCloud } from 'app/cross-refs-exports'
import { RemoteAndLocalMerger } from 'app/libs/cloud-sync/remote-and-local-merger.class'
import { askUser } from 'app/libs/cloud-sync/sync-prompt'
import { ProjectSyncHelpers } from 'app/libs/cloud-sync/project-sync-helpers.class'
import { DropboxHelper } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'
import { DropboxErrorCode, DropboxSyncError, getDropboxErrorMessage } from 'app/libs/cloud-sync/dropbox/dropbox-error.class'
import { markAsDropboxProject, planDropboxSync } from 'app/libs/cloud-sync/dropbox/dropbox-files.function'
import { DROPBOX_PROJECTS_FOLDER, DROPBOX_REMOTE_ID } from 'app/libs/cloud-sync/dropbox/dropbox.const'
import { ProjectDataImporter } from 'app/libs/projects-helpers/project-importers/project-data-importer.class'
import { Logger } from 'app/libs/logger/logger.class'
import { DateTools } from 'app/libs/tools/date-tools.class'
import { ANITA_URLS } from 'app/libs/routing/anita-routes.constant'
import { Project } from 'app/models/project/project.class'
import { ProjectDeletor } from 'app/models/project/project-deletor.class'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { Bucket } from 'app/state/bucket.state'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { ProjectState } from 'app/state/project/project-state.class'
import { RoutingState } from 'app/state/routing/routing-state.class'
import { SyncState } from 'app/state/sync/sync-state.class'
import type { IModalChoice } from 'app/libs/cloud-sync/sync-prompt'
import type { IDownloadedProject } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'
import type { IDropboxFileLink, IDropboxProjectFile } from 'app/libs/cloud-sync/dropbox/dropbox.const'
import type { IProjectSettings, TSystemData } from 'app/models/project/project.declarations'

/** Local changes are sent together after a short pause, as the whole project is a single file. */
const PUSH_DELAY_MS = 1500
/** A file changed by another device while syncing: the merge is run again with the new version. */
const MAX_CONFLICT_RETRIES = 3

/**
 * Sync between the projects on this device and the Dropbox account connected on this device.
 *
 * Each project is a JSON file. New files are created in the Anita folder of the Dropbox, and every project found
 * there is downloaded on the devices connected to the same account; files created elsewhere by older versions of
 * the app keep syncing on the devices that linked them.
 *
 * - Account level (`syncAccount`): imports the projects of the folder that are not on this device, uploads the
 *   projects to sync that have no file yet, and asks what to do with projects whose file was deleted.
 * - Project level (`syncProject`): two-way merge of the current project with its file.
 * - Local changes (`pushLocalChange`) are merged shortly after they are saved; if that fails, the next merge sends them.
 *
 * @feature sync.dropbox-projects
 * @title Sync projects with Dropbox
 * @summary Keeps each project chosen for Dropbox in a file of your Dropbox and merges the changes made on this device with those made on your other devices.
 * @where Chosen as storage of a project: "Dropbox" when creating a project, "Remote storage" in the project settings, or "Save it in Dropbox or WordPress" for a project saved only on this device. The project page shows "Remote storage: Dropbox", the "File" and "Last sync", with a "Sync now" button; the projects list marks it "Synced with Dropbox".
 * @usage 1. Connect Dropbox. 2. Choose Dropbox as storage of a project (optionally pick another folder with "Change"). 3. Work as usual: changes are sent to Dropbox a moment after they are saved, and changes made on other devices are received when the project is opened or checked again. 4. Use "Sync now" on the project page or on the Dropbox card of Storage and sync to sync right away.
 * @options Folder of the file: /Anita by default, or any folder chosen with "Change" (Choose a folder: browse, "New folder", "Save in <folder>"). Setting "Remote storage" back to "None: this device only" stops syncing (confirmation "Stop syncing with Dropbox?"): the project stays on this device and in Dropbox.
 * @rules Each project is one .json file named after the project title (Dropbox renames it if a file with the same name exists). Projects in the /Anita folder are downloaded automatically on every device connected to the same account; projects saved in other folders are opened on other devices with "Open from Dropbox". Local changes are grouped and sent about 1.5 seconds after the last save. Records are merged one by one using the time of their last change: a record changed on both sides since the last sync keeps the most recent version, and the project page says "N records were changed both on this device and on another one since the last sync. The most recent version was kept." If the file is changed by another device during a sync, the merge is retried up to 3 times. When Dropbox cannot be reached, changes stay on this device ("some changes are not synced yet") and are sent later. Deleting a synced project moves its file to the deleted files of Dropbox, where it can be restored for a while; if Dropbox cannot be reached the project is kept on this device. If Dropbox is not connected on the device the project page shows "Dropbox is not connected on this device" and a "Storage and sync" button.
 * @errors dropbox.network, dropbox.notConnected, dropbox.conflict, dropbox.insufficientSpace, dropbox.rateLimited, dropbox.serverError, dropbox.invalidFile, dropbox.unknown
 * @status beta
 * @since 0.18.0
 * @covers cloud:DROPBOX
 * @related sync.dropbox-connect, sync.dropbox-open-file, sync.dropbox-missing-file, sync.status, sync.automatic, storage.choice
 */
export class DropboxSync {
  private static accountRun: Promise<void> | undefined
  private static projectRuns: Record<string, Promise<void> | undefined> = {}
  /** Projects changed while being merged: merged again when the current run ends. */
  private static rerunRequested = new Set<string>()
  /**
   * Projects being linked or unlinked: the link uploads them, and their settings may not be updated everywhere yet.
   * Other syncs leave them alone.
   */
  private static busy = new Set<string>()
  /** Missing projects the user already decided not to handle in this session, or is being asked about. */
  private static postponedMissingProjects = new Set<string>()
  /** Project contained in each file of the folder (null: not a project). It never changes: each file is read once. */
  private static projectIdByFileId = new Map<string, string | null>()
  private static pushTimers: Record<string, ReturnType<typeof setTimeout> | undefined> = {}

  // ---------------------------------------------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------------------------------------------

  public static isDropboxProject (settings: Pick<IProjectSettings, 'remoteStorage'> | undefined): boolean {
    return settings?.remoteStorage === DROPBOX_REMOTE_ID
  }

  private static isSyncedWithDropbox (projectId: string): boolean {
    return DropboxSync.isDropboxProject(ProjectSyncHelpers.getLocalProjectSettings(projectId))
  }

  private static reportProjectError (projectId: string, error: unknown): void {
    SyncState.updateProjectStatus(projectId, { isSyncing: false, pendingChanges: true, error: getDropboxErrorMessage(error) })
  }

  /**
   * Projects linked to a Dropbox file by older versions of the app were not marked in their settings: marks them,
   * so that they are shown and synced as Dropbox projects. Returns the projects marked.
   */
  public static async adoptLegacyLinks (): Promise<Set<string>> {
    const adopted = new Set<string>()
    for (const link of await CloudSyncBase.getDropboxLinks()) {
      const settings = ProjectSyncHelpers.getLocalProjectSettings(link.projectId)
      if (settings && !settings.remoteStorage && !DropboxSync.busy.has(link.projectId)) {
        await ProjectSyncHelpers.saveSettingsSilently(link.projectId, { remoteStorage: DROPBOX_REMOTE_ID })
        adopted.add(link.projectId)
      }
    }
    return adopted
  }

  /**
   * The Anita projects in the Dropbox folder. Files not seen before are downloaded to read which project they contain;
   * their content is returned in `downloads`, to import them without downloading them again.
   */
  private static async indexProjectFiles (): Promise<{ files: Array<IDropboxProjectFile>; downloads: Map<string, IDownloadedProject> }> {
    const metas = await DropboxHelper.instance.listProjectFiles()
    const projectOfLinkedFile = new Map((await CloudSyncBase.getDropboxLinks()).map(link => [link.fileId, link.projectId]))
    const downloads = new Map<string, IDownloadedProject>()
    const files: Array<IDropboxProjectFile> = []
    for (const meta of metas) {
      let projectId = projectOfLinkedFile.get(meta.fileId) ?? DropboxSync.projectIdByFileId.get(meta.fileId)
      if (projectId === undefined) {
        try {
          const downloaded = await DropboxHelper.instance.downloadProject(meta.fileId)
          projectId = downloaded.data?.[RESERVED_AUDS_KEYS._settings][0].id ?? null
          if (downloaded.data) {
            downloads.set(meta.fileId, downloaded)
          }
        } catch (error) {
          const syncError = DropboxSyncError.from(error)
          if (syncError.isTemporary || syncError.requiresLogin) {
            throw syncError
          }
          // Deleted in the meantime, or unreadable: checked again at the next sync.
          continue
        }
        DropboxSync.projectIdByFileId.set(meta.fileId, projectId)
      }
      files.push({ ...meta, projectId })
    }
    return { files, downloads }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Account level
  // ---------------------------------------------------------------------------------------------------------------

  /**
   * Syncs the list of projects with the Dropbox folder. Concurrent calls share the same run.
   */
  public static syncAccount (): Promise<void> {
    if (!DropboxSync.accountRun) {
      DropboxSync.accountRun = DropboxSync.doSyncAccount().finally(() => {
        DropboxSync.accountRun = undefined
      })
    }
    return DropboxSync.accountRun
  }

  private static async doSyncAccount (): Promise<void> {
    if (!DropboxHelper.instance.isConnected()) {
      return
    }
    SyncState.updateRemoteStatus(DROPBOX_REMOTE_ID, { isSyncing: true })
    try {
      const adopted = await DropboxSync.adoptLegacyLinks()
      DropboxHelper.instance.refreshAccountInfo().catch(() => undefined)

      const { files, downloads } = await DropboxSync.indexProjectFiles()
      const links: Record<string, IDropboxFileLink> = Object.fromEntries((await CloudSyncBase.getDropboxLinks()).map(link => [link.projectId, link]))
      // The list of projects is updated asynchronously: projects just marked are counted as synced with Dropbox.
      const localProjects = ProjectSyncHelpers.getLocalProjects()
        .map(project => (adopted.has(project.id) ? { ...project, remoteStorage: DROPBOX_REMOTE_ID } : project))
      const syncedWithDropbox = new Set(localProjects.filter(project => DropboxSync.isDropboxProject(project)).map(project => project.id))

      // Linked files outside the folder (older versions let users choose it): do they still exist?
      const filesInFolder = new Set(files.map(file => file.fileId))
      const missingFileIds = new Set<string>()
      for (const link of Object.values(links)) {
        if (!filesInFolder.has(link.fileId) && syncedWithDropbox.has(link.projectId) && !(await DropboxHelper.instance.getFileMeta(link.fileId))) {
          missingFileIds.add(link.fileId)
        }
      }

      const plan = planDropboxSync(files, localProjects, links, missingFileIds)
      const isFree = (projectId: string) => !DropboxSync.busy.has(projectId)
      for (const projectId of plan.staleLinks.filter(isFree)) {
        // Checked against the stored settings: a link is never forgotten because of a list not updated yet.
        const stored = await ProjectSyncHelpers.getStoredProjectSettings(projectId)
        if (!stored || (stored.remoteStorage && !DropboxSync.isDropboxProject(stored))) {
          await DropboxSync.forgetSyncData(projectId)
        }
      }
      for (const file of plan.toImport) {
        await DropboxSync.importProject(file, downloads.get(file.fileId))
      }
      for (const { projectId, file } of plan.toLink.filter(item => isFree(item.projectId))) {
        await DropboxSync.linkToFile(projectId, file)
      }
      for (const projectId of plan.toUpload.filter(isFree)) {
        try {
          await DropboxSync.uploadProject(projectId)
        } catch (error) {
          DropboxSync.reportProjectError(projectId, error)
          if (DropboxSyncError.from(error).requiresLogin) {
            throw error
          }
        }
      }

      SyncState.updateRemoteStatus(DROPBOX_REMOTE_ID, { isSyncing: false, error: undefined, lastSync: DateTools.getUtcIsoString() })

      // Not awaited: the questions must not keep the sync running.
      DropboxSync.handleMissingProjects(plan.missing.filter(isFree))
    } catch (error) {
      SyncState.updateRemoteStatus(DROPBOX_REMOTE_ID, { isSyncing: false, error: getDropboxErrorMessage(error) })
    }
  }

  private static async importProject (file: IDropboxProjectFile, downloaded?: IDownloadedProject): Promise<void> {
    const startedAt = ProjectSyncHelpers.syncStartTime()
    try {
      const project = downloaded ?? await DropboxHelper.instance.downloadProject(file.fileId)
      if (!project.data) {
        return
      }
      const projectId = project.data[RESERVED_AUDS_KEYS._settings][0].id
      await new ProjectDataImporter(markAsDropboxProject(project.data)).import()
      await CloudSyncBase.saveDropboxLink(DropboxHelper.linkFromMeta(projectId, project))
      await DropboxHelper.instance.setLastSync(projectId, startedAt)
    } catch (error) {
      const syncError = DropboxSyncError.from(error)
      if (syncError.isTemporary || syncError.requiresLogin) {
        throw syncError
      }
      // A broken file must not stop the import of the others.
      Logger.error('[DropboxSync] import failed', `${file.path}: ${syncError.message}`)
    }
  }

  /**
   * Links a project to a file that already contains it. The first merge keeps the records of both sides.
   */
  private static async linkToFile (projectId: string, file: IDropboxProjectFile): Promise<void> {
    await CloudSyncBase.deleteLastSync(projectId)
    await CloudSyncBase.saveDropboxLink({ projectId, fileId: file.fileId, path: file.path, name: file.name })
    if (ProjectSyncHelpers.isCurrentProject(projectId)) {
      DropboxSync.syncProject(projectId)
    }
  }

  /**
   * Saves a whole local project in a new file: in the folder chosen for it (`dropboxFolder`), or in the Anita folder.
   */
  private static async uploadProject (projectId: string): Promise<void> {
    const startedAt = ProjectSyncHelpers.syncStartTime()
    const systemData = await ProjectSyncHelpers.getSystemData(projectId)
    // Checked against the stored settings: the project may have just stopped syncing with Dropbox.
    if (!systemData || !DropboxSync.isDropboxProject(systemData[RESERVED_AUDS_KEYS._settings][0])) {
      return
    }
    SyncState.updateProjectStatus(projectId, { isSyncing: true })
    const folder = systemData[RESERVED_AUDS_KEYS._settings][0].dropboxFolder
    const data = markAsDropboxProject(await new Project(systemData).getAllData())
    const meta = await DropboxHelper.instance.createProjectFile(data, folder || DROPBOX_PROJECTS_FOLDER)
    DropboxSync.projectIdByFileId.set(meta.fileId, projectId)
    await CloudSyncBase.saveDropboxLink(DropboxHelper.linkFromMeta(projectId, meta))
    await DropboxHelper.instance.setLastSync(projectId, startedAt)
    if (folder !== undefined) {
      // Needed only for the first upload.
      await ProjectSyncHelpers.saveSettingsSilently(projectId, { dropboxFolder: undefined })
    }
    SyncState.updateProjectStatus(projectId, { isSyncing: false, error: undefined, pendingChanges: false, lastSync: DateTools.getUtcIsoString() })
  }

  /**
   * Projects whose file was deleted from Dropbox, for example from another device: users decide.
   *
   * @feature sync.dropbox-missing-file
   * @title Projects whose file was deleted from Dropbox
   * @summary Asks what to do with a project of this device when its file is no longer in your Dropbox, for example because it was deleted from another device.
   * @where A dialog titled "<project> is no longer in your Dropbox", shown while syncing with Dropbox.
   * @usage Pick one of the choices of the dialog; closing it asks again at the next session.
   * @options "Keep on this device only" (stops syncing, the project becomes local), "Save it again in Dropbox" (creates a new file), "Delete from this device".
   * @rules The copy on this device is never deleted without asking. One question at a time is shown, also when several syncs run together. A project deleted on another device with "Delete" is moved to the deleted files of Dropbox, so the other devices show this dialog.
   * @errors dropbox.notFound
   * @status beta
   * @since 1.0.0
   * @related sync.dropbox-projects
   */
  private static async handleMissingProjects (missing: Array<string>): Promise<void> {
    for (const projectId of missing) {
      const project = ProjectSyncHelpers.getLocalProjectSettings(projectId)
      if (!project || DropboxSync.postponedMissingProjects.has(projectId)) {
        continue
      }
      DropboxSync.postponedMissingProjects.add(projectId)
      const choices: Array<IModalChoice<'keep' | 'upload' | 'delete'>> = [
        { value: 'keep', label: 'Keep on this device only', type: Type.secondary },
        { value: 'upload', label: 'Save it again in Dropbox', type: Type.secondary },
        { value: 'delete', label: 'Delete from this device', type: Type.danger },
      ]
      const choice = await askUser(
        `"${project.title}" is no longer in your Dropbox`,
        (
          <div className="text-sm text-gray-600">
            <p>The file of this project was deleted from your Dropbox, maybe from another device.</p>
            <p className="mt-2">The copy on this device has not been deleted. What do you want to do?</p>
          </div>
        ),
        choices,
      )

      if (choice) {
        DropboxSync.postponedMissingProjects.delete(projectId)
      }
      if (choice === 'delete') {
        await DropboxSync.removeLocalCopy(projectId)
      } else if (choice === 'keep') {
        await DropboxSync.unlinkProject(projectId)
      } else if (choice === 'upload') {
        await DropboxSync.forgetSyncData(projectId)
        try {
          await DropboxSync.uploadProject(projectId)
        } catch (error) {
          DropboxSync.reportProjectError(projectId, error)
        }
      }
    }
  }

  /**
   * Deletes a project from this device only.
   */
  public static async removeLocalCopy (projectId: string): Promise<void> {
    if (ProjectSyncHelpers.isCurrentProject(projectId)) {
      ProjectState.resetCurrentProject()
      // Without view transition: this can happen while the user is navigating.
      RoutingState.navigate(ANITA_URLS.projectsList)
    }
    DropboxSync.busy.add(projectId)
    try {
      await new ProjectDeletor(projectId).delete({ deleteOnRemote: false })
    } finally {
      DropboxSync.busy.delete(projectId)
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Linking
  // ---------------------------------------------------------------------------------------------------------------

  /**
   * Starts syncing a local project with Dropbox: links it to its file if the Anita folder already has one (re-linked,
   * or imported from a backup), otherwise saves it in a new file, in `folder` if given. Then the projects of the Anita
   * folder are downloaded.
   */
  public static async linkProject (projectId: string, options: { folder?: string } = {}): Promise<void> {
    SyncState.updateProjectStatus(projectId, { isSyncing: true, error: undefined })
    DropboxSync.busy.add(projectId)
    let mergeAfterLink = false
    try {
      const settings = (await ProjectSyncHelpers.getSystemData(projectId))?.[RESERVED_AUDS_KEYS._settings][0]
      if (settings && (!DropboxSync.isDropboxProject(settings) || options.folder !== undefined)) {
        await ProjectSyncHelpers.saveSettingsSilently(projectId, {
          remoteStorage: DROPBOX_REMOTE_ID,
          remoteAccessLevel: undefined,
          dropboxFolder: !options.folder || options.folder === DROPBOX_PROJECTS_FOLDER ? settings.dropboxFolder : options.folder,
        })
      }
      const existing = (await DropboxSync.indexProjectFiles()).files.find(file => file.projectId === projectId)
      if (existing) {
        await CloudSyncBase.deleteLastSync(projectId)
        await CloudSyncBase.saveDropboxLink({ projectId, fileId: existing.fileId, path: existing.path, name: existing.name })
        mergeAfterLink = true
      } else {
        await DropboxSync.uploadProject(projectId)
      }
    } catch (error) {
      DropboxSync.reportProjectError(projectId, error)
      throw error
    } finally {
      DropboxSync.busy.delete(projectId)
    }
    if (mergeAfterLink) {
      await DropboxSync.syncProject(projectId)
    }
    await DropboxSync.syncAccount()
  }

  /**
   * Opens a project file chosen by the user anywhere in Dropbox: imports it, or links the copy already on this
   * device to it. From then on the project is synced with that file. Returns the id of the project.
   */
  public static async importFromFile (fileId: string): Promise<string> {
    const startedAt = ProjectSyncHelpers.syncStartTime()
    const downloaded = await DropboxHelper.instance.downloadProject(fileId)
    if (!downloaded.data) {
      throw new DropboxSyncError(DropboxErrorCode.invalidFile, `${downloaded.name} is not an Anita project.`)
    }
    const projectId = downloaded.data[RESERVED_AUDS_KEYS._settings][0].id
    DropboxSync.projectIdByFileId.set(downloaded.fileId, projectId)
    const link = await CloudSyncBase.getDropboxLink(projectId)
    if (link?.fileId === downloaded.fileId) {
      return projectId
    }
    if (link) {
      throw new DropboxSyncError(DropboxErrorCode.invalidFile, `This project is already on this device, synced with ${link.path ?? 'another file of your Dropbox'}.`)
    }

    const local = await ProjectSyncHelpers.getStoredProjectSettings(projectId)
    if (!local) {
      await new ProjectDataImporter(markAsDropboxProject(downloaded.data)).import()
      await CloudSyncBase.saveDropboxLink(DropboxHelper.linkFromMeta(projectId, downloaded))
      await DropboxHelper.instance.setLastSync(projectId, startedAt)
      return projectId
    }
    if (local.remoteStorage && !DropboxSync.isDropboxProject(local)) {
      throw new DropboxSyncError(DropboxErrorCode.invalidFile, 'This project is already on this device, synced with a WordPress site.')
    }
    // The copy on this device and the file are merged, keeping the records of both.
    DropboxSync.busy.add(projectId)
    try {
      if (!DropboxSync.isDropboxProject(local)) {
        await ProjectSyncHelpers.saveSettingsSilently(projectId, { remoteStorage: DROPBOX_REMOTE_ID, remoteAccessLevel: undefined })
      }
      await CloudSyncBase.deleteLastSync(projectId)
      await CloudSyncBase.saveDropboxLink({ projectId, fileId: downloaded.fileId, path: downloaded.path, name: downloaded.name })
    } finally {
      DropboxSync.busy.delete(projectId)
    }
    if (ProjectSyncHelpers.isCurrentProject(projectId)) {
      DropboxSync.syncProject(projectId)
    }
    return projectId
  }

  /**
   * Stops syncing a project. Its data stays on this device and in Dropbox.
   */
  public static async unlinkProject (projectId: string): Promise<void> {
    DropboxSync.busy.add(projectId)
    try {
      await ProjectSyncHelpers.saveSettingsSilently(projectId, { remoteStorage: undefined, remoteAccessLevel: undefined })
      await DropboxSync.forgetSyncData(projectId)
    } finally {
      DropboxSync.busy.delete(projectId)
    }
  }

  private static async forgetSyncData (projectId: string): Promise<void> {
    clearTimeout(DropboxSync.pushTimers[projectId])
    await CloudSyncBase.deleteDropboxLink(projectId)
    await CloudSyncBase.deleteLastSync(projectId)
    SyncState.updateProjectStatus(projectId, { isSyncing: false, error: undefined, pendingChanges: false, lastSync: undefined, notice: undefined })
  }

  /**
   * Removes the Dropbox account from this device. Its projects are kept as local projects, or deleted from this
   * device. Nothing is deleted in Dropbox.
   */
  public static async disconnect (options: { deleteLocalProjects: boolean }): Promise<void> {
    const projects = ProjectSyncHelpers.getLocalProjects().filter(project => DropboxSync.isDropboxProject(project))
    for (const project of projects) {
      if (options.deleteLocalProjects) {
        await DropboxSync.removeLocalCopy(project.id)
      } else {
        await DropboxSync.unlinkProject(project.id)
      }
    }
    for (const link of await CloudSyncBase.getDropboxLinks()) {
      await DropboxSync.forgetSyncData(link.projectId)
    }
    DropboxSync.projectIdByFileId.clear()
    await DropboxHelper.instance.forgetAccount()
  }

  /**
   * Another Dropbox account was connected on this device: the projects of the previous account stop syncing and are
   * kept on this device, so that they are not copied to the new account.
   */
  public static async onAccountSwitched (): Promise<void> {
    for (const project of ProjectSyncHelpers.getLocalProjects().filter(item => DropboxSync.isDropboxProject(item))) {
      await DropboxSync.unlinkProject(project.id)
    }
    for (const link of await CloudSyncBase.getDropboxLinks()) {
      await DropboxSync.forgetSyncData(link.projectId)
    }
    DropboxSync.projectIdByFileId.clear()
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Project level
  // ---------------------------------------------------------------------------------------------------------------

  /**
   * Two-way merge of the current project with its file. A call made while a merge is running runs it again afterwards,
   * so that changes saved in the meantime are sent too.
   */
  public static syncProject (projectId: string): Promise<void> {
    const running = DropboxSync.projectRuns[projectId]
    if (running) {
      DropboxSync.rerunRequested.add(projectId)
      return running
    }
    const run = (async () => {
      do {
        DropboxSync.rerunRequested.delete(projectId)
        await DropboxSync.doSyncProject(projectId)
      } while (DropboxSync.rerunRequested.has(projectId))
    })().finally(() => {
      DropboxSync.projectRuns[projectId] = undefined
    })
    DropboxSync.projectRuns[projectId] = run
    return run
  }

  private static async doSyncProject (projectId: string): Promise<void> {
    const project = Bucket.general.get(ProjectAtoms.currentProject)
    if (!project || project.getId() !== projectId || !DropboxSync.isSyncedWithDropbox(projectId) || DropboxSync.busy.has(projectId) || !DropboxHelper.instance.isConnected()) {
      return
    }
    const link = await CloudSyncBase.getDropboxLink(projectId)
    if (!link) {
      // Never uploaded: handled at account level.
      await DropboxSync.syncAccount()
      return
    }
    SyncState.updateProjectStatus(projectId, { isSyncing: true })
    try {
      let outcome = null
      for (let attempt = 1; ; attempt++) {
        try {
          outcome = await new RemoteAndLocalMerger(link.fileId, SupportedCloud.DROPBOX, project).sync()
          break
        } catch (error) {
          if (DropboxSyncError.from(error).code !== DropboxErrorCode.conflict || attempt >= MAX_CONFLICT_RETRIES) {
            throw error
          }
        }
      }
      if (outcome?.dropboxFile) {
        await CloudSyncBase.saveDropboxLink(DropboxHelper.linkFromMeta(projectId, outcome.dropboxFile))
      }
      SyncState.updateProjectStatus(projectId, {
        isSyncing: false,
        error: undefined,
        pendingChanges: false,
        lastSync: DateTools.getUtcIsoString(),
        notice: outcome?.conflicts
          ? `${outcome.conflicts} ${outcome.conflicts === 1 ? 'record was' : 'records were'} changed both on this device and on another one since the last sync. The most recent version was kept.`
          : undefined,
      })
    } catch (error) {
      if (DropboxSyncError.from(error).code === DropboxErrorCode.notFound) {
        // Deleted from Dropbox: handled at account level, where the user is asked what to do.
        SyncState.updateProjectStatus(projectId, { isSyncing: false })
        await DropboxSync.syncAccount()
        return
      }
      DropboxSync.reportProjectError(projectId, error)
    }
  }

  /**
   * Syncs the current project if its file changed since the last sync, or if local changes are pending.
   */
  public static async syncCurrentProjectIfNeeded (): Promise<void> {
    const projectId = Bucket.general.get(ProjectAtoms.currentProject)?.getId()
    if (!projectId || !DropboxSync.isSyncedWithDropbox(projectId) || !DropboxHelper.instance.isConnected()) {
      return
    }
    if (SyncState.getProjectStatus(projectId)?.pendingChanges) {
      return DropboxSync.syncProject(projectId)
    }
    const link = await CloudSyncBase.getDropboxLink(projectId)
    if (!link) {
      return DropboxSync.syncAccount()
    }
    try {
      const meta = await DropboxHelper.instance.getFileMeta(link.fileId)
      if (!meta) {
        return DropboxSync.syncAccount()
      }
      if (meta.rev !== link.rev || !(await CloudSyncBase.getLastSync(projectId))) {
        await DropboxSync.syncProject(projectId)
      }
    } catch (error) {
      DropboxSync.reportProjectError(projectId, error)
    }
  }

  /**
   * Called after a project is created or edited on this device: links, unlinks or syncs it.
   */
  public static async onProjectSaved (systemData: TSystemData): Promise<void> {
    const settings = systemData[RESERVED_AUDS_KEYS._settings][0]
    const projectId = settings.id
    const link = await CloudSyncBase.getDropboxLink(projectId)

    if (!DropboxSync.isDropboxProject(settings)) {
      if (link) {
        await DropboxSync.forgetSyncData(projectId)
      }
      return
    }
    if (!DropboxHelper.instance.isConnected()) {
      SyncState.updateProjectStatus(projectId, { pendingChanges: true })
      return
    }
    if (!link) {
      await DropboxSync.linkProject(projectId).catch(() => undefined)
      return
    }
    SyncState.updateProjectStatus(projectId, { pendingChanges: true })
    await DropboxSync.syncProject(projectId)
  }

  /**
   * Called after a record is saved or deleted: the change is merged shortly, together with the following ones.
   */
  public static pushLocalChange (projectId: string): void {
    if (!DropboxSync.isSyncedWithDropbox(projectId)) {
      return
    }
    SyncState.updateProjectStatus(projectId, { pendingChanges: true })
    if (!DropboxHelper.instance.isConnected()) {
      return
    }
    clearTimeout(DropboxSync.pushTimers[projectId])
    DropboxSync.pushTimers[projectId] = setTimeout(() => {
      DropboxSync.pushTimers[projectId] = undefined
      DropboxSync.syncProject(projectId)
    }, PUSH_DELAY_MS)
  }

  /**
   * Moves the file of a project to the deleted files of Dropbox. Throws if Dropbox cannot be reached, so that the
   * local copy is kept.
   */
  public static async deleteRemoteProject (projectId: string): Promise<void> {
    const link = await CloudSyncBase.getDropboxLink(projectId)
    if (!link || !DropboxSync.isSyncedWithDropbox(projectId)) {
      return
    }
    clearTimeout(DropboxSync.pushTimers[projectId])
    await DropboxHelper.instance.deleteFile(link.fileId)
    DropboxSync.projectIdByFileId.delete(link.fileId)
  }
}
