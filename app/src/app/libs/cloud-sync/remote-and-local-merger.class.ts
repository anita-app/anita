import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { CloudSyncBase, Manager, SupportedCloud } from 'app/cross-refs-exports'
import { DropboxHelper } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'
import { ComparatorRunner } from 'app/libs/cloud-sync/comparator-runner.class'
import { SyncState } from 'app/state/sync/sync-state.class'
import { Bucket } from 'app/state/bucket.state'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { DateTools } from 'app/libs/tools/date-tools.class'
import { RESERVED_FIELDS } from 'app/models/reserved-fields.constant'
import { ProjectSaver } from 'app/models/project/project-saver.class'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { WordPressApiError, WordPressErrorCode } from 'app/libs/cloud-sync/wordpress/wordpress-api-error.class'
import type { Project } from 'app/models/project/project.class'
import type { IComparisonResult } from 'app/models/project/syncing/project-comparator'
import type { TAnitaUniversalDataStorage, TSystemData } from 'app/models/project/project.declarations'
import type { ISectionElement } from 'app/models/section-element/section-element.declarations'
import type { WordPressClient } from 'app/libs/cloud-sync/wordpress/wordpress-client.class'
import type { IWordPressBatchOperation, IWordPressProjectMeta, IWordPressProjectResponse } from 'app/libs/cloud-sync/wordpress/wordpress.const'

/**
 * Changes made on another device while a sync is running must not be considered older than the sync.
 * lastSync is therefore set to the start of the sync, minus this margin to absorb small clock differences.
 */
const LAST_SYNC_SAFETY_MARGIN_MS = 2 * 60 * 1000

export interface IMergeOutcome {
  /** Records changed both on this device and remotely since the last sync; the most recent version was kept. */
  conflicts: number
  pulled: number
  pushed: number
  /** Metadata returned by the site when the structure was sent. */
  meta?: IWordPressProjectMeta
}

export interface IWordPressMergeOptions {
  client: WordPressClient
  remote: IWordPressProjectResponse
}

const SYSTEM_KEYS: Array<string> = [RESERVED_AUDS_KEYS._settings, RESERVED_AUDS_KEYS._sections]

/**
 * JSON with sorted keys, to compare objects regardless of key order.
 */
const stableStringify = (value: unknown): string => JSON.stringify(value, (_key, val) => (
  val && typeof val === 'object' && !Array.isArray(val)
    ? Object.keys(val).sort().reduce<Record<string, unknown>>((sorted, key) => {
      sorted[key] = val[key]; return sorted
    }, {})
    : val
))

/**
 * Two-way merge of a project with its remote copy (a Dropbox file or a WordPress site).
 *
 * Records are compared by `updatedAt` (or `createdAt`) and with the time of the last successful sync,
 * to tell apart records added on one side from records deleted on the other. Changes received from the
 * remote are written directly to the local database, so they are not sent back to the remote.
 */
export class RemoteAndLocalMerger {
  private project: Project

  constructor (
    private remoteId: string,
    private type: SupportedCloud,
    project?: Project,
    private wordPress?: IWordPressMergeOptions,
  ) {
    this.project = project ?? Bucket.general.get(ProjectAtoms.currentProject)!
  }

  public async sync (): Promise<IMergeOutcome | null> {
    SyncState.setIsSyncing(true)
    try {
      const syncStartedAt = new Date(Date.now() - LAST_SYNC_SAFETY_MARGIN_MS).toISOString()
      const lastSync = await CloudSyncBase.getLastSync(this.project.getId())
      const localData = await this.project.getAllData()
      const remoteData = await this.getRemoteData()
      if (!remoteData) {
        return null
      }

      this.alignSections(localData, remoteData)
      const structure = this.type === SupportedCloud.WORDPRESS ? this.resolveWordPressStructure(lastSync, localData, remoteData) : null

      const result = await ComparatorRunner.compare(lastSync, localData, remoteData)

      const outcome: IMergeOutcome = {
        conflicts: this.countConflicts(lastSync, localData, remoteData, result),
        pulled: this.countChanges(result, 'local'),
        pushed: this.countChanges(result, 'remote'),
      }

      const mergedStructure: TSystemData = { [RESERVED_AUDS_KEYS._settings]: localData[RESERVED_AUDS_KEYS._settings], [RESERVED_AUDS_KEYS._sections]: localData[RESERVED_AUDS_KEYS._sections] }
      if (structure?.pull) {
        // Before the records: new sections need their tables.
        await this.saveSystemDataLocally(mergedStructure)
      }
      if (structure?.push) {
        outcome.meta = await this.wordPress!.client.saveProject(mergedStructure, { accessLevel: mergedStructure[RESERVED_AUDS_KEYS._settings][0].remoteAccessLevel, replaceSections: true })
      }
      if (outcome.pulled) {
        await this.saveLocalChanges(result)
      }
      if (outcome.pushed) {
        await this.sendToRemote(result)
      }

      await new CloudSyncBase(this.type).setLastSync(this.project.getId(), syncStartedAt)
      return outcome
    } finally {
      SyncState.setIsSyncing(false)
    }
  }

  /**
   * On WordPress the structure (settings and sections) is not merged record by record. The site's version wins,
   * unless an owner or administrator changed it on this device after the last sync and after the site's version:
   * then this device's version is sent, keeping the sections added on the site since the last sync.
   * Afterwards both sides carry the same structure, so the comparison only concerns records.
   */
  private resolveWordPressStructure (lastSync: string | undefined, localData: TAnitaUniversalDataStorage, remoteData: TAnitaUniversalDataStorage): { push: boolean; pull: boolean } | null {
    const local = { settings: localData[RESERVED_AUDS_KEYS._settings], sections: localData[RESERVED_AUDS_KEYS._sections] }
    const remote = { settings: remoteData[RESERVED_AUDS_KEYS._settings], sections: remoteData[RESERVED_AUDS_KEYS._sections] }
    // localStorage is a device setting and remoteStorage is implied by the site: neither is compared.
    const comparable = (structure: typeof local) => stableStringify({
      ...structure,
      settings: structure.settings.map(settings => ({ ...settings, localStorage: undefined, remoteStorage: undefined })),
    })
    if (comparable(local) === comparable(remote)) {
      return null
    }

    const localUpdatedAt = local.settings[0]?.[RESERVED_FIELDS.updatedAt]
    const remoteUpdatedAt = remote.settings[0]?.[RESERVED_FIELDS.updatedAt] ?? remote.settings[0]?.[RESERVED_FIELDS.createdAt]
    const editedHere = !!localUpdatedAt && (!lastSync || DateTools.firstIsAfterSecond(localUpdatedAt, lastSync)) && DateTools.firstIsAfterSecond(localUpdatedAt, remoteUpdatedAt)

    if (!this.wordPress!.remote.meta.can_manage || !editedHere) {
      localData[RESERVED_AUDS_KEYS._settings] = remote.settings
      localData[RESERVED_AUDS_KEYS._sections] = remote.sections
      return { push: false, pull: true }
    }

    // Sections created on the site after the last sync are not known here: they are kept, not deleted.
    const localIds = new Set(local.sections.map(section => section.id))
    const addedOnSite = remote.sections.filter(section => (
      !localIds.has(section.id) && (!lastSync || DateTools.firstIsAfterSecond(section[RESERVED_FIELDS.createdAt], lastSync))
    ))
    const sections = [...local.sections, ...addedOnSite]
    localData[RESERVED_AUDS_KEYS._sections] = sections
    remoteData[RESERVED_AUDS_KEYS._settings] = local.settings
    remoteData[RESERVED_AUDS_KEYS._sections] = sections
    return { push: true, pull: addedOnSite.length > 0 }
  }

  private async getRemoteData (): Promise<TAnitaUniversalDataStorage | null> {
    if (this.type === SupportedCloud.DROPBOX) {
      return DropboxHelper.instance.downloadFile(this.project.getId(), this.remoteId)
    }
    return JSON.parse(JSON.stringify(this.wordPress!.remote.project))
  }

  /**
   * Makes sure every section has a list of records on both sides, so new sections are compared too.
   */
  private alignSections (localData: TAnitaUniversalDataStorage, remoteData: TAnitaUniversalDataStorage): void {
    const sectionIds = new Set([
      ...(localData[RESERVED_AUDS_KEYS._sections] ?? []).map(section => section.id),
      ...(remoteData[RESERVED_AUDS_KEYS._sections] ?? []).map(section => section.id),
    ])
    sectionIds.forEach((sectionId) => {
      localData[sectionId] = localData[sectionId] ?? []
      remoteData[sectionId] = remoteData[sectionId] ?? []
    })
  }

  private countChanges (result: IComparisonResult, scope: 'local' | 'remote'): number {
    return (['insert', 'update', 'delete'] as const).reduce((total, action) => (
      total + Object.values(result[scope][action]).reduce((sum, elements) => sum + (elements?.length ?? 0), 0)
    ), 0)
  }

  /**
   * A conflict is a record updated on both sides since the last sync.
   */
  private countConflicts (lastSync: string | undefined, localData: TAnitaUniversalDataStorage, remoteData: TAnitaUniversalDataStorage, result: IComparisonResult): number {
    if (!lastSync) {
      return 0
    }
    let conflicts = 0
    for (const scope of ['local', 'remote'] as const) {
      const losingSide = scope === 'local' ? localData : remoteData
      for (const section in result[scope].update) {
        if (SYSTEM_KEYS.includes(section)) {
          continue
        }
        for (const element of result[scope].update[section] ?? []) {
          const loser = losingSide[section]?.find(ele => ele.id === element.id)
          const loserDate = loser?.[RESERVED_FIELDS.updatedAt] ?? loser?.[RESERVED_FIELDS.createdAt]
          if (loserDate && DateTools.firstIsAfterSecond(loserDate, lastSync)) {
            conflicts++
          }
        }
      }
    }
    return conflicts
  }

  private hasSystemChanges (result: IComparisonResult, scope: 'local' | 'remote'): boolean {
    return (['insert', 'update', 'delete'] as const).some(action => SYSTEM_KEYS.some(key => !!result[scope][action][key]?.length))
  }

  private async saveLocalChanges (result: IComparisonResult): Promise<void> {
    const projectId = this.project.getId()
    if (this.hasSystemChanges(result, 'local')) {
      await this.saveSystemDataLocally({
        [RESERVED_AUDS_KEYS._settings]: result.localData[RESERVED_AUDS_KEYS._settings],
        [RESERVED_AUDS_KEYS._sections]: result.localData[RESERVED_AUDS_KEYS._sections],
      })
    }

    for (const action of ['insert', 'update', 'delete'] as const) {
      for (const section in result.local[action]) {
        const elements = result.local[action][section] ?? []
        if (SYSTEM_KEYS.includes(section) || !elements.length || !dbInstances[projectId]?.DS[section]) {
          continue
        }
        if (action === 'delete') {
          for (const element of elements) {
            await dbInstances[projectId].callDeletor(section, { id: element.id }).autoDelete()
          }
        } else {
          await dbInstances[projectId].callInsertor<Array<ISectionElement>>(section, elements).autoInsert()
        }
        SyncState.setLastSyncedId(section)
      }
    }
  }

  /**
   * Saves settings and sections received from the remote, keeping their timestamps and without triggering another sync.
   */
  private async saveSystemDataLocally (systemData: TSystemData): Promise<void> {
    const settings = { ...systemData[RESERVED_AUDS_KEYS._settings][0] }
    if (this.type === SupportedCloud.WORDPRESS) {
      settings.remoteStorage = this.remoteId
    }
    const saved = await new ProjectSaver({ ...systemData, [RESERVED_AUDS_KEYS._settings]: [settings] }, EDITOR_MODE.edit, { fromSync: true }).save()
    if (Bucket.general.get(ProjectAtoms.currentProject)?.getId() === this.project.getId()) {
      Manager.setCurrentProject(saved)
    }
  }

  private async sendToRemote (result: IComparisonResult): Promise<void> {
    if (this.type === SupportedCloud.DROPBOX) {
      await DropboxHelper.instance.updateFile(this.remoteId, result.remoteData)
      return
    }
    await this.sendChangesToWordPress(result)
  }

  private async sendChangesToWordPress (result: IComparisonResult): Promise<void> {
    const { client } = this.wordPress!
    const projectId = this.project.getId()

    // The structure was already handled by resolveWordPressStructure.
    const operations: Array<IWordPressBatchOperation> = []
    for (const action of ['insert', 'update', 'delete'] as const) {
      for (const section in result.remote[action]) {
        if (SYSTEM_KEYS.includes(section)) {
          continue
        }
        for (const element of result.remote[action][section] ?? []) {
          operations.push(action === 'delete'
            ? { action: 'delete', sectionId: section, elementId: element.id! }
            : { action: 'upsert', sectionId: section, elementId: element.id!, element })
        }
      }
    }
    if (!operations.length) {
      return
    }

    const failures = await RemoteAndLocalMerger.sendOperations(client, projectId, operations)
    // Records of sections that no longer exist on the site cannot be saved there: they stay on this device.
    const blocking = failures.filter(failure => failure.error.code !== WordPressErrorCode.notFound)
    if (blocking.length) {
      throw blocking[0].error
    }
  }

  /**
   * Sends record changes with the batch endpoint, or one by one if the site does not support it.
   */
  public static async sendOperations (client: WordPressClient, projectId: string, operations: Array<IWordPressBatchOperation>): Promise<Array<{ operation: IWordPressBatchOperation; error: WordPressApiError }>> {
    try {
      return await client.batchSectionElements(projectId, operations)
    } catch (error) {
      if (!(error instanceof WordPressApiError) || error.code !== WordPressErrorCode.pluginMissing) {
        throw error
      }
    }
    const failures: Array<{ operation: IWordPressBatchOperation; error: WordPressApiError }> = []
    for (const operation of operations) {
      try {
        if (operation.action === 'delete') {
          await client.deleteSectionElement(projectId, operation.sectionId, operation.elementId)
        } else {
          await client.saveSectionElement(projectId, operation.sectionId, operation.elementId, operation.element!)
        }
      } catch (error) {
        const apiError = WordPressApiError.from(error)
        if (apiError.isTemporary || apiError.requiresLogin) {
          throw apiError
        }
        failures.push({ operation, error: apiError })
      }
    }
    return failures
  }
}
