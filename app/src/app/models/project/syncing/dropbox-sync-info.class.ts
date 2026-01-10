import type { CloudSyncState } from 'app/libs/cloud-sync/cloud-sync.const'

export class DropboxSyncInfo {
  private cloudSyncState: CloudSyncState | null = null
  private linkedFileId: string | null = null

  public getCloudSyncState = (): CloudSyncState | null => this.cloudSyncState

  public getLinkedFileId = (): string | null => this.linkedFileId

  public setCloudSyncState = (cloudSyncState: CloudSyncState | null): void => {
    this.cloudSyncState = cloudSyncState
  }

  public setLinkedFileId = (linkedFileId: string | null): void => {
    this.linkedFileId = linkedFileId
  }
}
