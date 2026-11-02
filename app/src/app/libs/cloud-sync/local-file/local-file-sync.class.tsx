import { CloudSyncBase, SupportedCloud } from 'app/cross-refs-exports'
import { RemoteAndLocalMerger } from 'app/libs/cloud-sync/remote-and-local-merger.class'
import { askUser } from 'app/libs/cloud-sync/sync-prompt'
import { ProjectSyncHelpers } from 'app/libs/cloud-sync/project-sync-helpers.class'
import { LocalFileHelper } from 'app/libs/cloud-sync/local-file/local-file-helper.class'
import { LocalFileErrorCode, LocalFileSyncError, getLocalFileErrorMessage } from 'app/libs/cloud-sync/local-file/local-file-error.class'
import { LOCAL_FILE_REMOTE_ID, isLocalFileSyncSupported } from 'app/libs/cloud-sync/local-file/local-file.const'
import { DateTools } from 'app/libs/tools/date-tools.class'
import { Logger } from 'app/libs/logger/logger.class'
import { Project } from 'app/models/project/project.class'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { Bucket } from 'app/state/bucket.state'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { SyncState } from 'app/state/sync/sync-state.class'
import type { ILocalFileLink } from 'app/libs/cloud-sync/local-file/local-file.const'
import type { IProjectSettings, TSystemData } from 'app/models/project/project.declarations'

/** Local changes are written together after a short pause, as the whole project is a single file. */
const PUSH_DELAY_MS = 800
/** The file changed by another program while syncing: the merge is run again with the new version. */
const MAX_CONFLICT_RETRIES = 3

/**
 * Sync between a project on this device and a file on this computer, chosen by the user.
 *
 * The project stays in the browser's database, as every project, and is also written in the file. The file can be
 * changed outside Anita (edited by hand, restored from a backup, synced by another program): the sync is always
 * two-way, with the same merge used for Dropbox. Browsers ask the user to allow Anita to use the file, usually once
 * per visit: until then, changes are kept in the browser.
 *
 * @feature sync.local-file-projects
 * @title Sync a project with a file on your computer
 * @summary Keeps a project saved also in a file of your computer, and reads the changes made to that file outside Anita.
 * @where Chosen as storage of a project: "A file on this computer" when creating a project from a template, in "Remote storage" of the project settings, in the dialog "Keep your project safe", or in the "Import project" dialog, where the imported file is chosen already. The project page shows "Remote storage: A file on this computer", the "File" and "Last sync", with "Sync now", "Choose the file" and "Save in a new file"; the projects list marks it "Synced with <file name>".
 * @usage 1. Choose "A file on this computer" and pick where to save the file (when importing, the imported file is used). 2. Each time the project is opened, allow Anita to use the file ("Allow access"). 3. Work as usual: changes are written in the file a moment after they are saved; changes made to the file are read when the project is opened, when the window gets focus and every few seconds.
 * @options Where the file is saved and its name (by default the title of the project, in the last folder used). Setting "Remote storage" back to "None: this device only" stops syncing (confirmation "Stop syncing with the file?"): the project stays in the browser and the file stays on the computer.
 * @rules Available only in Chromium-based browsers on a computer (Chrome, Edge, Opera...): elsewhere the option is not offered and the project page explains it. The file is a regular Anita export ("Data and Structure") that can be imported anywhere. Records are merged one by one using the time of their last change, as with Dropbox; a record changed by hand in the file, without changing its dates, counts as changed when the file was saved; records added by hand without an id or creation date get them, and are written back to the file; records removed from the file are removed from the project. A file that is not valid JSON, or not an Anita project, is never overwritten: the project page shows "Sync problem" and changes stay in the browser until the file is fixed or a new file is chosen. A file that was moved, renamed or deleted must be chosen again ("Choose the file") or replaced ("Save in a new file"). Deleting the project never deletes the file. The project exists only on this computer: to use it on other devices, store it in Dropbox or on WordPress.
 * @errors localFile.unsupported, localFile.permissionNeeded, localFile.notFound, localFile.invalidFile, localFile.otherProject, localFile.conflict, localFile.unknown
 * @status beta
 * @since 1.0.0
 * @covers cloud:LOCAL_FILE
 * @related sync.local-file-access, import.file-sync, storage.choice, sync.status, sync.automatic
 */
export class LocalFileSync {
  private static projectRuns: Record<string, Promise<void> | undefined> = {}
  private static rerunRequested = new Set<string>()
  /** Projects being linked or unlinked: other syncs leave them alone. */
  private static busy = new Set<string>()
  private static pushTimers: Record<string, ReturnType<typeof setTimeout> | undefined> = {}
  /** Files chosen in a form for a project not saved yet: linked when the project is saved. */
  private static pendingFiles = new Map<string, FileSystemFileHandle>()
  /** Projects for which the permission was already asked in this visit. */
  private static askedPermission = new Set<string>()

  // ---------------------------------------------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------------------------------------------

  public static isLocalFileProject (settings: Pick<IProjectSettings, 'remoteStorage'> | undefined): boolean {
    return settings?.remoteStorage === LOCAL_FILE_REMOTE_ID
  }

  private static isSyncedWithFile (projectId: string): boolean {
    return LocalFileSync.isLocalFileProject(ProjectSyncHelpers.getLocalProjectSettings(projectId))
  }

  private static reportProjectError (projectId: string, error: unknown, fileName?: string): void {
    const syncError = LocalFileSyncError.from(error)
    const needsAccess = syncError.code === LocalFileErrorCode.permissionNeeded
      ? 'permission'
      : (syncError.code === LocalFileErrorCode.notFound ? 'file' : undefined)
    SyncState.updateProjectStatus(projectId, { isSyncing: false, pendingChanges: true, needsAccess, error: getLocalFileErrorMessage(syncError, fileName) })
  }

  /**
   * Remembers the file chosen in a form for a project: it is linked when the project is saved.
   */
  public static setPendingFile (projectId: string, handle: FileSystemFileHandle | undefined): void {
    if (handle) {
      LocalFileSync.pendingFiles.set(projectId, handle)
    } else {
      LocalFileSync.pendingFiles.delete(projectId)
    }
  }

  public static getPendingFile (projectId: string): FileSystemFileHandle | undefined {
    return LocalFileSync.pendingFiles.get(projectId)
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Linking
  // ---------------------------------------------------------------------------------------------------------------

  /**
   * Starts syncing a project with a file. If the file already contains the project, the two are merged keeping the
   * records of both; if it is empty, the project is written in it. Any other content is replaced only with `overwrite`
   * (a file chosen with "Save", whose replacement the browser already confirmed), otherwise it is an error.
   */
  public static async linkProject (projectId: string, handle: FileSystemFileHandle, options: { overwrite: boolean }): Promise<void> {
    const startedAt = ProjectSyncHelpers.syncStartTime()
    SyncState.updateProjectStatus(projectId, { isSyncing: true, error: undefined, needsAccess: undefined })
    LocalFileSync.busy.add(projectId)
    let mergeAfterLink = false
    try {
      if (!(await LocalFileHelper.requestPermission(handle))) {
        throw new LocalFileSyncError(LocalFileErrorCode.permissionNeeded, 'Permission not granted')
      }
      let content: Awaited<ReturnType<typeof LocalFileHelper.read>> | null = null
      try {
        content = await LocalFileHelper.read(handle)
      } catch (error) {
        if (!options.overwrite || LocalFileSyncError.from(error).code !== LocalFileErrorCode.invalidFile) {
          throw error
        }
      }
      const containsProject = content?.data?.[RESERVED_AUDS_KEYS._settings][0].id === projectId
      if (content?.data && !containsProject && !options.overwrite) {
        throw new LocalFileSyncError(LocalFileErrorCode.otherProject, `${handle.name} contains another project.`)
      }

      const systemData = await ProjectSyncHelpers.getSystemData(projectId)
      const settings = systemData?.[RESERVED_AUDS_KEYS._settings][0]
      if (settings && (!LocalFileSync.isLocalFileProject(settings) || settings.remoteAccessLevel || settings.dropboxFolder)) {
        await ProjectSyncHelpers.saveSettingsSilently(projectId, { remoteStorage: LOCAL_FILE_REMOTE_ID, remoteAccessLevel: undefined, dropboxFolder: undefined })
      }

      if (containsProject) {
        await CloudSyncBase.deleteLastSync(projectId)
        await CloudSyncBase.saveLocalFileLink({ projectId, handle, name: handle.name })
        mergeAfterLink = true
      } else {
        const fresh = await ProjectSyncHelpers.getSystemData(projectId)
        if (!fresh) {
          return
        }
        const lastModified = await LocalFileHelper.write(handle, await new Project(fresh).getAllData())
        await CloudSyncBase.saveLocalFileLink({ projectId, handle, name: handle.name, lastModified })
        await new CloudSyncBase(SupportedCloud.LOCAL_FILE).setLastSync(projectId, startedAt)
        SyncState.updateProjectStatus(projectId, { isSyncing: false, error: undefined, pendingChanges: false, needsAccess: undefined, lastSync: DateTools.getUtcIsoString() })
      }
    } catch (error) {
      LocalFileSync.reportProjectError(projectId, error, handle.name)
      throw error
    } finally {
      LocalFileSync.busy.delete(projectId)
    }
    if (mergeAfterLink) {
      await LocalFileSync.syncProject(projectId)
    }
  }

  /**
   * Asks for the file of a project (moved, renamed, or never linked in this browser) and syncs with it.
   * Must be called from a click. Returns false if the user cancels.
   */
  public static async chooseExistingFile (projectId: string): Promise<boolean> {
    const handle = await LocalFileHelper.pickExistingFile()
    if (!handle) {
      return false
    }
    await LocalFileSync.linkProject(projectId, handle, { overwrite: false })
    return true
  }

  /**
   * Asks where to save a new file for a project and writes it there. Must be called from a click.
   * Returns false if the user cancels.
   */
  public static async saveInNewFile (projectId: string, projectTitle: string): Promise<boolean> {
    const handle = await LocalFileHelper.pickNewFile(projectTitle)
    if (!handle) {
      return false
    }
    await LocalFileSync.linkProject(projectId, handle, { overwrite: true })
    return true
  }

  /**
   * Stops syncing a project. Its data stays in the browser and in the file.
   */
  public static async unlinkProject (projectId: string): Promise<void> {
    LocalFileSync.busy.add(projectId)
    try {
      await ProjectSyncHelpers.saveSettingsSilently(projectId, { remoteStorage: undefined, remoteAccessLevel: undefined })
      await LocalFileSync.forgetSyncData(projectId)
    } finally {
      LocalFileSync.busy.delete(projectId)
    }
  }

  /**
   * Forgets the file of a project (it is never deleted from the computer).
   */
  public static async forgetSyncData (projectId: string): Promise<void> {
    clearTimeout(LocalFileSync.pushTimers[projectId])
    LocalFileSync.pendingFiles.delete(projectId)
    await CloudSyncBase.deleteLocalFileLink(projectId)
    await CloudSyncBase.deleteLastSync(projectId)
    SyncState.updateProjectStatus(projectId, { isSyncing: false, error: undefined, pendingChanges: false, lastSync: undefined, notice: undefined, needsAccess: undefined })
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Permission
  // ---------------------------------------------------------------------------------------------------------------

  /**
   * Asks the browser for the permission to use the file of a project, then syncs. Must be called from a click.
   */
  public static async requestAccess (projectId: string): Promise<boolean> {
    const link = await CloudSyncBase.getLocalFileLink(projectId)
    if (!link) {
      SyncState.updateProjectStatus(projectId, { needsAccess: 'file' })
      return false
    }
    const granted = await LocalFileHelper.requestPermission(link.handle)
    if (!granted) {
      SyncState.updateProjectStatus(projectId, { needsAccess: 'permission', error: getLocalFileErrorMessage(new LocalFileSyncError(LocalFileErrorCode.permissionNeeded, ''), link.name) })
      return false
    }
    SyncState.updateProjectStatus(projectId, { needsAccess: undefined, error: undefined })
    await LocalFileSync.syncProject(projectId)
    return true
  }

  /**
   * When a project is opened and the browser needs the permission to use its file: a dialog asks for it, once per visit.
   * Closing it leaves the banner of the project, which asks again.
   *
   * @feature sync.local-file-access
   * @title Allow Anita to open the file of a project
   * @summary Asks your permission to read and write the file on your computer that a project is synced with, as browsers require.
   * @where A dialog "Allow Anita to open <file>?" when a project synced with a file is opened; then, until allowed, the blue banner "Anita needs your permission to open <file>" at the top of the project pages and a note on the project page.
   * @usage Click "Allow access", then allow it in the browser's prompt. To avoid being asked at every visit, choose "Allow on every visit" in the prompt, when the browser offers it.
   * @options "Allow access" or "Not now" in the dialog. In the browser's prompt: allow this time, allow on every visit (where offered), or don't allow.
   * @rules Browsers forget the permission when Anita is closed, unless "Allow on every visit" was chosen, so the question comes back at the next visit. Until it is allowed, the project works as usual and its changes are kept in the browser: they are written in the file once allowed. The dialog is shown once per visit for each project; the banner stays until access is allowed.
   * @errors localFile.permissionNeeded
   * @status beta
   * @since 1.0.0
   * @related sync.local-file-projects
   */
  private static async promptForPermission (projectId: string, link: ILocalFileLink): Promise<void> {
    if (LocalFileSync.askedPermission.has(projectId)) {
      return
    }
    LocalFileSync.askedPermission.add(projectId)
    const choice = await askUser(
      `Allow Anita to open ${link.name}?`,
      (
        <div className="text-sm text-gray-600">
          <p>This project is synced with <strong>{link.name}</strong> on your computer. Your browser asks your permission before Anita can read and write it.</p>
          <p className="mt-2">If your browser offers <strong>Allow on every visit</strong>, choose it so that you are not asked again. Until you allow it, your changes are kept in this browser.</p>
        </div>
      ),
      [
        { value: 'later', label: 'Not now', type: Type.secondary },
        { value: 'allow', label: 'Allow access', type: Type.primary },
      ],
      { hideCancelButton: true },
    )
    if (choice === 'allow' && ProjectSyncHelpers.isCurrentProject(projectId)) {
      await LocalFileSync.requestAccess(projectId)
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Project level
  // ---------------------------------------------------------------------------------------------------------------

  /**
   * Two-way merge of the current project with its file. A call made while a merge is running runs it again afterwards.
   */
  public static syncProject (projectId: string): Promise<void> {
    const running = LocalFileSync.projectRuns[projectId]
    if (running) {
      LocalFileSync.rerunRequested.add(projectId)
      return running
    }
    const run = (async () => {
      do {
        LocalFileSync.rerunRequested.delete(projectId)
        await LocalFileSync.doSyncProject(projectId)
      } while (LocalFileSync.rerunRequested.has(projectId))
    })().finally(() => {
      LocalFileSync.projectRuns[projectId] = undefined
    })
    LocalFileSync.projectRuns[projectId] = run
    return run
  }

  private static async doSyncProject (projectId: string): Promise<void> {
    const project = Bucket.general.get(ProjectAtoms.currentProject)
    if (!project || project.getId() !== projectId || !LocalFileSync.isSyncedWithFile(projectId) || LocalFileSync.busy.has(projectId)) {
      return
    }
    if (!isLocalFileSyncSupported()) {
      LocalFileSync.reportProjectError(projectId, new LocalFileSyncError(LocalFileErrorCode.unsupported, ''))
      return
    }
    const link = await CloudSyncBase.getLocalFileLink(projectId)
    if (!link) {
      SyncState.updateProjectStatus(projectId, { isSyncing: false, needsAccess: 'file' })
      return
    }
    if (await LocalFileHelper.queryPermission(link.handle) !== 'granted') {
      SyncState.updateProjectStatus(projectId, { isSyncing: false, needsAccess: 'permission' })
      LocalFileSync.promptForPermission(projectId, link)
      return
    }

    SyncState.updateProjectStatus(projectId, { isSyncing: true, needsAccess: undefined })
    try {
      let outcome = null
      for (let attempt = 1; ; attempt++) {
        try {
          outcome = await new RemoteAndLocalMerger(projectId, SupportedCloud.LOCAL_FILE, project, undefined, { handle: link.handle, lastModified: link.lastModified }).sync()
          break
        } catch (error) {
          if (LocalFileSyncError.from(error).code !== LocalFileErrorCode.conflict || attempt >= MAX_CONFLICT_RETRIES) {
            throw error
          }
        }
      }
      if (outcome?.localFileModified !== undefined) {
        await CloudSyncBase.updateLocalFileLink(projectId, { lastModified: outcome.localFileModified })
      }
      SyncState.updateProjectStatus(projectId, {
        isSyncing: false,
        error: undefined,
        pendingChanges: false,
        needsAccess: undefined,
        lastSync: DateTools.getUtcIsoString(),
        notice: outcome?.conflicts
          ? `${outcome.conflicts} ${outcome.conflicts === 1 ? 'record was' : 'records were'} changed both in Anita and in the file since the last sync. The most recent version was kept.`
          : undefined,
      })
    } catch (error) {
      Logger.error('[LocalFileSync] sync failed', (error as Error)?.message)
      LocalFileSync.reportProjectError(projectId, error, link.name)
    }
  }

  /**
   * Syncs the current project if its file changed since the last sync, or if local changes are pending.
   * Never asks for the permission: that happens when the project is opened, or from the banner.
   */
  public static async syncCurrentProjectIfNeeded (): Promise<void> {
    const projectId = Bucket.general.get(ProjectAtoms.currentProject)?.getId()
    if (!projectId || !LocalFileSync.isSyncedWithFile(projectId) || !isLocalFileSyncSupported() || LocalFileSync.projectRuns[projectId]) {
      return
    }
    const link = await CloudSyncBase.getLocalFileLink(projectId)
    if (!link || await LocalFileHelper.queryPermission(link.handle) !== 'granted') {
      return
    }
    if (SyncState.getProjectStatus(projectId)?.pendingChanges) {
      return LocalFileSync.syncProject(projectId)
    }
    try {
      const lastModified = await LocalFileHelper.getLastModified(link.handle)
      if (lastModified !== link.lastModified || !(await CloudSyncBase.getLastSync(projectId))) {
        await LocalFileSync.syncProject(projectId)
      }
    } catch (error) {
      LocalFileSync.reportProjectError(projectId, error, link.name)
    }
  }

  /**
   * Called after a project is created or edited on this device: links, unlinks or syncs it.
   */
  public static async onProjectSaved (systemData: TSystemData): Promise<void> {
    const settings = systemData[RESERVED_AUDS_KEYS._settings][0]
    const projectId = settings.id
    const pending = LocalFileSync.pendingFiles.get(projectId)

    if (!LocalFileSync.isLocalFileProject(settings)) {
      LocalFileSync.pendingFiles.delete(projectId)
      if (await CloudSyncBase.getLocalFileLink(projectId)) {
        await LocalFileSync.forgetSyncData(projectId)
      }
      return
    }
    if (pending) {
      LocalFileSync.pendingFiles.delete(projectId)
      await LocalFileSync.linkProject(projectId, pending, { overwrite: true }).catch(() => undefined)
      return
    }
    if (!(await CloudSyncBase.getLocalFileLink(projectId))) {
      SyncState.updateProjectStatus(projectId, { pendingChanges: true, needsAccess: 'file' })
      return
    }
    SyncState.updateProjectStatus(projectId, { pendingChanges: true })
    await LocalFileSync.syncProject(projectId)
  }

  /**
   * Called after a record is saved or deleted: the change is written shortly, together with the following ones.
   */
  public static pushLocalChange (projectId: string): void {
    if (!LocalFileSync.isSyncedWithFile(projectId)) {
      return
    }
    SyncState.updateProjectStatus(projectId, { pendingChanges: true })
    clearTimeout(LocalFileSync.pushTimers[projectId])
    LocalFileSync.pushTimers[projectId] = setTimeout(() => {
      LocalFileSync.pushTimers[projectId] = undefined
      LocalFileSync.syncProject(projectId)
    }, PUSH_DELAY_MS)
  }
}
