import { RESERVED_AUDS_KEYS, TAnitaUniversalDataStorage, TSystemData } from 'app/models/project/project.declarations'
import { IComparisonResult } from 'app/models/project/syncing/project-comparator'
import { Manager } from 'app/libs/manager/manager.class'
import { Project } from 'app/models/project/project.class'
import { DropboxHelper } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { IS_SYNCING } from 'app/libs/cloud-sync/sync-manager.const'
import { CloudSyncBase } from 'app/libs/cloud-sync/cloud-sync-base.class'

export class RemoteAndLocalMerger {
  private project: Project
  private static comparatorWorker: Worker | undefined

  constructor (private remoteId: string) {
    this.project = Manager.getCurrentProject()!
    IS_SYNCING.next(false)
  }

  public async sync (): Promise<void> {
    this.setWorker()
    IS_SYNCING.next(true)
    const lastSync = await this.getLastSync()
    const localData = await this.getLocalData()
    const remoteData = await this.getRemoteData()
    if (!remoteData) {
      IS_SYNCING.next(false)
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

  private async getRemoteData (): Promise<TAnitaUniversalDataStorage> {
    return DropboxHelper.instance.downloadFile(this.project.getId(), this.remoteId)
  }

  private sendToWorkerForComparison (lastSync: string | undefined, localData: TAnitaUniversalDataStorage, remoteData: TAnitaUniversalDataStorage): void {
    RemoteAndLocalMerger.comparatorWorker!.postMessage({
      lastSync,
      localData,
      remoteData
    })
  }

  private handleComparisonResult = async (comparisonResult: IComparisonResult): Promise<void> => {
    if (this.hasScopeChanges('local', comparisonResult)) {
      await this.saveLocalChanges(comparisonResult)
    }
    await this.sendToRemote(comparisonResult)
    IS_SYNCING.next(false)
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
        [RESERVED_AUDS_KEYS._sections]: comparisonResult.localData[RESERVED_AUDS_KEYS._sections]
      }
      await this.project.updateSystemData(newSystemData)
    }
    for (const action in comparisonResult.local) {
      const actionAsKey = action as keyof IComparisonResult['local']
      if (Object.values(comparisonResult.local[actionAsKey]).length) {
        for (const section in comparisonResult.local[actionAsKey]) {
          if (section === RESERVED_AUDS_KEYS._settings || section === RESERVED_AUDS_KEYS._sections) {
            continue
          }
          const sectionAsKey = section as keyof IComparisonResult['local'][typeof actionAsKey] & string
          this.handleSectionElements(actionAsKey, sectionAsKey, comparisonResult)
        }
      }
    }
    Manager.loadProjectsList()
  }

  private async handleSectionElements<A extends keyof IComparisonResult['local']> (
    actionAsKey: A,
    section: keyof IComparisonResult['local'][A] & string,
    comparisonResult: IComparisonResult
  ): Promise<void> {
    const sectionObject = this.project.getSectionById(section)!
    if (comparisonResult.local[actionAsKey]?.[section]?.length) {
      for (const element of comparisonResult.local[actionAsKey][section]!) {
        if (actionAsKey === 'insert') {
          await sectionObject.saveElement(element, EDITOR_MODE.add)
        }
        if (actionAsKey === 'update') {
          await sectionObject.saveElement(element, EDITOR_MODE.edit)
        }
        if (actionAsKey === 'delete') {
          await sectionObject.deleteElement(element)
        }
      }
    }
  }

  private async sendToRemote (comparisonResult: IComparisonResult): Promise<void> {
    if (this.hasScopeChanges('remote', comparisonResult)) {
      await DropboxHelper.instance.updateFile(this.remoteId, comparisonResult.remoteData)
    }
  }

  private hasScopeChanges (scope: keyof IComparisonResult, comparisonResult: IComparisonResult): boolean {
    return !!Object.values(comparisonResult[scope].delete).length ||
    !!Object.values(comparisonResult[scope].update).length ||
    !!Object.values(comparisonResult[scope].insert).length
  }
}
