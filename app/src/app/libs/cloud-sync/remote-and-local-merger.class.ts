import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { CloudSyncBase, Manager, SupportedCloud } from 'app/cross-refs-exports'
import { DropboxHelper } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { SyncState } from 'app/state/sync/sync-state.class'
import { WordpressHelper } from 'app/libs/cloud-sync/wordpress/wordpress-helper.class'
import type { Project } from 'app/models/project/project.class'
import type { IComparisonResult } from 'app/models/project/syncing/project-comparator'
import type { TAnitaUniversalDataStorage, TSystemData } from 'app/models/project/project.declarations'
import type { WordPressClient } from 'app/libs/cloud-sync/wordpress/wordpress-client.class'

export class RemoteAndLocalMerger {
  private project: Project
  private wpClient: WordPressClient | undefined
  private static comparatorWorker: Worker | undefined

  constructor (
    private remoteId: string,
    private type: SupportedCloud,
  ) {
    this.project = Manager.getCurrentProject()!
    SyncState.setIsSyncing(false)
  }

  public async sync (): Promise<void> {
    this.setWorker()
    SyncState.setIsSyncing(true)
    const lastSync = await this.getLastSync()
    const localData = await this.getLocalData()
    const remoteData = await this.getRemoteData()
    if (!remoteData) {
      SyncState.setIsSyncing(false)
      return
    }
    this.sendToWorkerForComparison(lastSync, localData, remoteData)
  }

  private setWorker (): void {
    if (!RemoteAndLocalMerger.comparatorWorker) {
      RemoteAndLocalMerger.comparatorWorker = new Worker(new URL('app/workers/comparator.worker', import.meta.url), { type: 'module' })
      RemoteAndLocalMerger.comparatorWorker.onmessage = (event: MessageEvent<IComparisonResult>) => {
        this.handleComparisonResult(event.data)
      }
    }
  }

  private async getLastSync (): Promise<string | undefined> {
    return CloudSyncBase.getLastSync(this.project.getId())
  }

  private getLocalData (): Promise<TAnitaUniversalDataStorage> {
    return this.project.getAllData()
  }

  private async getRemoteData (): Promise<TAnitaUniversalDataStorage | null> {
    if (this.type === SupportedCloud.DROPBOX) {
      return DropboxHelper.instance.downloadFile(this.project.getId(), this.remoteId)
    } else if (this.type === SupportedCloud.WORDPRESS) {
      const client = await WordpressHelper.instance.getClient(this.remoteId)
      if (client) {
        this.wpClient = client
        return this.wpClient.getProjectById(this.project.getId()) || null
      }
    }
    return null
  }

  private sendToWorkerForComparison (lastSync: string | undefined, localData: TAnitaUniversalDataStorage, remoteData: TAnitaUniversalDataStorage): void {
    RemoteAndLocalMerger.comparatorWorker!.postMessage({
      lastSync,
      localData,
      remoteData,
    })
  }

  private handleComparisonResult = async (comparisonResult: IComparisonResult): Promise<void> => {
    if (this.hasScopeChanges('local', comparisonResult)) {
      await this.saveLocalChanges(comparisonResult)
    }
    await this.sendToRemote(comparisonResult)
    SyncState.setIsSyncing(false)
  }

  private async saveLocalChanges (comparisonResult: IComparisonResult): Promise<void> {
    const allSectionsWithUpdates = Object.keys(comparisonResult.local.update)
    const allSectionsWithInserts = Object.keys(comparisonResult.local.insert)
    const allSectionsWithDeletes = Object.keys(comparisonResult.local.delete)
    if (allSectionsWithUpdates.includes(RESERVED_AUDS_KEYS._settings) ||
      allSectionsWithUpdates.includes(RESERVED_AUDS_KEYS._sections) ||
      allSectionsWithInserts.includes(RESERVED_AUDS_KEYS._settings) ||
      allSectionsWithInserts.includes(RESERVED_AUDS_KEYS._sections) ||
      allSectionsWithDeletes.includes(RESERVED_AUDS_KEYS._settings) ||
      allSectionsWithDeletes.includes(RESERVED_AUDS_KEYS._sections)
    ) {
      const newSystemData: TSystemData = {
        [RESERVED_AUDS_KEYS._settings]: comparisonResult.localData[RESERVED_AUDS_KEYS._settings],
        [RESERVED_AUDS_KEYS._sections]: comparisonResult.localData[RESERVED_AUDS_KEYS._sections],
      }
      await this.project.updateSystemData(newSystemData)
      SyncState.setLastSyncedId(newSystemData[RESERVED_AUDS_KEYS._settings][0].id)
      Object.keys(newSystemData[RESERVED_AUDS_KEYS._sections]).forEach((sectionId) => {
        SyncState.setLastSyncedId(sectionId)
      })
    }
    for (const action in comparisonResult.local) {
      const actionAsKey = action as keyof IComparisonResult['local']
      if (Object.values(comparisonResult.local[actionAsKey]).length) {
        for (const section in comparisonResult.local[actionAsKey]) {
          if (section === RESERVED_AUDS_KEYS._settings || section === RESERVED_AUDS_KEYS._sections) {
            continue
          }
          const sectionAsKey = section as keyof IComparisonResult['local'][typeof actionAsKey] & string
          this.saveSectionElementsLocally(actionAsKey, sectionAsKey, comparisonResult)
        }
      }
    }
  }

  private async saveSectionElementsLocally<A extends keyof IComparisonResult['local']> (
    actionAsKey: A,
    section: keyof IComparisonResult['local'][A] & string,
    comparisonResult: IComparisonResult,
  ): Promise<void> {
    const sectionObject = this.project.getSectionById(section)!
    const sectionId = sectionObject.id
    if (comparisonResult.local[actionAsKey]?.[section]?.length) {
      for (const element of comparisonResult.local[actionAsKey][section]!) {
        const elementId = element.id
        if (actionAsKey === 'insert') {
          await sectionObject.saveElement(element, EDITOR_MODE.add)
        }
        if (actionAsKey === 'update') {
          await sectionObject.saveElement(element, EDITOR_MODE.edit)
        }
        if (actionAsKey === 'delete') {
          await sectionObject.deleteElement(element)
        }
        if (elementId) {
          SyncState.setLastSyncedId(elementId)
        }
      }
      SyncState.setLastSyncedId(sectionId)
    }
  }

  private async sendToRemote (comparisonResult: IComparisonResult): Promise<void> {
    if (this.hasScopeChanges('remote', comparisonResult)) {
      if (this.type === SupportedCloud.DROPBOX) {
        await DropboxHelper.instance.updateFile(this.remoteId, comparisonResult.remoteData)
      } else if (this.type === SupportedCloud.WORDPRESS) {
        await this.sendChangesToWordPress(comparisonResult)
      }
    }
  }

  private async sendChangesToWordPress (comparisonResult: IComparisonResult): Promise<void> {
    const allSectionsWithUpdates = Object.keys(comparisonResult.remote.update)
    const allSectionsWithInserts = Object.keys(comparisonResult.remote.insert)
    const allSectionsWithDeletes = Object.keys(comparisonResult.remote.delete)
    if (allSectionsWithUpdates.includes(RESERVED_AUDS_KEYS._settings) ||
      allSectionsWithUpdates.includes(RESERVED_AUDS_KEYS._sections) ||
      allSectionsWithInserts.includes(RESERVED_AUDS_KEYS._settings) ||
      allSectionsWithInserts.includes(RESERVED_AUDS_KEYS._sections) ||
      allSectionsWithDeletes.includes(RESERVED_AUDS_KEYS._settings) ||
      allSectionsWithDeletes.includes(RESERVED_AUDS_KEYS._sections)
    ) {
      const newSystemData: TSystemData = {
        [RESERVED_AUDS_KEYS._settings]: comparisonResult.remoteData[RESERVED_AUDS_KEYS._settings],
        [RESERVED_AUDS_KEYS._sections]: comparisonResult.remoteData[RESERVED_AUDS_KEYS._sections],
      }
      await this.wpClient!.saveProject(newSystemData)
      SyncState.setLastSyncedId(newSystemData[RESERVED_AUDS_KEYS._settings][0].id)
      Object.keys(newSystemData[RESERVED_AUDS_KEYS._sections]).forEach((sectionId) => {
        SyncState.setLastSyncedId(sectionId)
      })
    }
    for (const action in comparisonResult.remote) {
      const actionAsKey = action as keyof IComparisonResult['remote']
      if (Object.values(comparisonResult.remote[actionAsKey]).length) {
        for (const section in comparisonResult.remote[actionAsKey]) {
          if (section === RESERVED_AUDS_KEYS._settings || section === RESERVED_AUDS_KEYS._sections) {
            continue
          }
          const sectionAsKey = section as keyof IComparisonResult['remote'][typeof actionAsKey] & string
          this.sendSectionElementsToRemoteWordPress(actionAsKey, sectionAsKey, comparisonResult)
        }
      }
    }
  }

  private async sendSectionElementsToRemoteWordPress<A extends keyof IComparisonResult['remote']> (
    actionAsKey: A,
    section: keyof IComparisonResult['remote'][A] & string,
    comparisonResult: IComparisonResult,
  ): Promise<void> {
    const projectId = this.project.getId()
    const sectionObject = this.project.getSectionById(section)!
    const sectionId = sectionObject.id
    if (comparisonResult.remote[actionAsKey]?.[section]?.length) {
      for (const element of comparisonResult.remote[actionAsKey][section]!) {
        const elementId = element.id!
        if (actionAsKey === 'insert' || actionAsKey === 'update') {
          await this.wpClient!.saveSectionElement(projectId, sectionId, elementId, element)
        }
        if (actionAsKey === 'delete') {
          await this.wpClient!.deleteSectionElement(projectId, sectionId, elementId)
        }
        SyncState.setLastSyncedId(elementId)
      }
      SyncState.setLastSyncedId(sectionId)
    }
  }

  private hasScopeChanges (scope: keyof IComparisonResult, comparisonResult: IComparisonResult): boolean {
    return !!Object.values(comparisonResult[scope].delete).length ||
    !!Object.values(comparisonResult[scope].update).length ||
    !!Object.values(comparisonResult[scope].insert).length
  }
}
