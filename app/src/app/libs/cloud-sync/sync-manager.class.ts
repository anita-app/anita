import { TAnitaUniversalDataStorage } from 'app/models/project/project.declarations'
import { Comparator, IComparisonResult } from 'app/models/project/syncing/project-comparator'
import { Manager } from 'app/libs/manager/manager.class'
import { Project } from 'app/models/project/project.class'
import { DropboxHelper } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'

export class SyncManager {
  private static instance: SyncManager

  private project: Project

  constructor (private remoteId: string) {
    this.project = Manager.getCurrentProject()!
  }

  public async sync (): Promise<void> {
    const lastSync = await this.getLastSync()
    const localData = await this.getLocalData()
    const remoteData = await this.getRemoteData()
    const comparisonResult = await this.compare(lastSync, localData, remoteData)
    await this.saveLocalChanges(comparisonResult)
    await this.sendToRemote(comparisonResult)
  }

  private async getLastSync (): Promise<string | undefined> {
    return DropboxHelper.instance.getLastSync(this.project.getId())
  }

  private getLocalData (): Promise<TAnitaUniversalDataStorage> {
    return this.project.getAllData()
  }

  private async getRemoteData (): Promise<TAnitaUniversalDataStorage> {
    const remoteData = await DropboxHelper.instance.downloadFile(this.remoteId)
    return remoteData
  }

  private async compare (lastSync: string | undefined, localData: TAnitaUniversalDataStorage, remoteData: TAnitaUniversalDataStorage): Promise<IComparisonResult> {
    const comparisonResult = await new Comparator(lastSync, localData, remoteData).compare()
    return comparisonResult
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async saveLocalChanges (comparisonResult: IComparisonResult): Promise<void> {
    // TODO: save local changes
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async sendToRemote (comparisonResult: IComparisonResult): Promise<void> {
    // TODO send to remote
  }
}
