import { RESERVED_AUDS_KEYS, TAnitaUniversalDataStorage, TSystemData } from 'app/models/project/project.declarations'
import { Comparator, IComparisonResult } from 'app/models/project/syncing/project-comparator'
import { Manager } from 'app/libs/manager/manager.class'
import { Project } from 'app/models/project/project.class'
import { DropboxHelper } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'
import { Subject } from 'rxjs'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'

export class SyncManager {
  public static isSyncing = new Subject<boolean>()

  private project: Project

  constructor (private remoteId: string) {
    this.project = Manager.getCurrentProject()!
    SyncManager.isSyncing.next(false)
  }

  public async sync (): Promise<void> {
    SyncManager.isSyncing.next(true)
    const lastSync = await this.getLastSync()
    const localData = await this.getLocalData()
    const remoteData = await this.getRemoteData()
    if (!remoteData) {
      SyncManager.isSyncing.next(false)
      return
    }
    const comparisonResult = await this.compare(lastSync, localData, remoteData)
    await this.saveLocalChanges(comparisonResult)
    await this.sendToRemote(comparisonResult)
    SyncManager.isSyncing.next(false)
  }

  private async getLastSync (): Promise<string | undefined> {
    return DropboxHelper.instance.getLastSync(this.project.getId())
  }

  private getLocalData (): Promise<TAnitaUniversalDataStorage> {
    return this.project.getAllData()
  }

  private async getRemoteData (): Promise<TAnitaUniversalDataStorage> {
    return DropboxHelper.instance.downloadFile(this.remoteId)
  }

  private async compare (lastSync: string | undefined, localData: TAnitaUniversalDataStorage, remoteData: TAnitaUniversalDataStorage): Promise<IComparisonResult> {
    const comparisonResult = await new Comparator(lastSync, localData, remoteData).compare()
    console.log('compare ~ comparisonResult', comparisonResult)
    return comparisonResult
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async saveLocalChanges (comparisonResult: IComparisonResult): Promise<void> {
    const allSectionsUpdated = Object.keys(comparisonResult.local.update)
    const allSectionsInserted = Object.keys(comparisonResult.local.insert)
    const allSectionsDeleted = Object.keys(comparisonResult.local.delete)
    if (allSectionsUpdated.includes(RESERVED_AUDS_KEYS._settings) ||
      allSectionsUpdated.includes(RESERVED_AUDS_KEYS._sections) ||
      allSectionsInserted.includes(RESERVED_AUDS_KEYS._settings) ||
      allSectionsInserted.includes(RESERVED_AUDS_KEYS._sections) ||
      allSectionsDeleted.includes(RESERVED_AUDS_KEYS._settings) ||
      allSectionsDeleted.includes(RESERVED_AUDS_KEYS._sections)) {
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
                // TODO - delete element
                // await sectionObject.deleteElement(element)
              }
            }
          }
        }
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async sendToRemote (comparisonResult: IComparisonResult): Promise<void> {
    const hasDeleteChanges = !!Object.values(comparisonResult.remote.delete).length
    const hasUpdateChanges = !!Object.values(comparisonResult.remote.update).length
    const hasCreateChanges = !!Object.values(comparisonResult.remote.insert).length
    if (hasDeleteChanges || hasUpdateChanges || hasCreateChanges) {
      DropboxHelper.instance.updateFile(this.remoteId, comparisonResult.remoteData)
    }
  }
}
