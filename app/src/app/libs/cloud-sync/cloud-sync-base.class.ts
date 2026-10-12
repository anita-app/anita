import { Manager } from 'app/cross-refs-exports'
import { DateTools } from 'app/libs/tools/date-tools.class'
import Dexie from 'dexie'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { Bucket } from 'app/state/bucket.state'
import { CloudSyncTable } from './cloud-sync.const'
import type { IRemoteProjectInfo, IWordPressAuthData, IWordPressRemoteInfo, IWordPressSpaceInfo } from 'app/libs/cloud-sync/wordpress/wordpress.const'
import type { IDropboxTokens } from './cloud-sync.const'

const DB_VERSION = 7

export enum SupportedCloud {
  DROPBOX = 'dropbox',
  WORDPRESS = 'wordpress',
}

interface IAccountsTableForDropbox extends IDropboxTokens {
  service: SupportedCloud
}

interface IAccountsTableForWordpress extends IWordPressAuthData {
  service: SupportedCloud
}

type TDataForTable<T extends SupportedCloud> = T extends SupportedCloud.DROPBOX ? IDropboxTokens : IWordPressAuthData

type TAccountsTable<T extends SupportedCloud> = T extends SupportedCloud.DROPBOX ? IAccountsTableForDropbox : IAccountsTableForWordpress

interface ICloudSyncDB<T extends SupportedCloud> {
  [CloudSyncTable.ACCOUNTS]: TAccountsTable<T>
  [CloudSyncTable.SYNC_INFO]: {
    projectId: string
    lastSync: string
  }
  [CloudSyncTable.FILES_INFO]: {
    projectId: string
    fileId: string
  }
  [CloudSyncTable.REMOTES_INFO]: IWordPressRemoteInfo
  [CloudSyncTable.REMOTE_PROJECTS]: IRemoteProjectInfo
}

export class CloudSyncBase<T extends SupportedCloud> {
  private static DB: Dexie | undefined
  constructor (
    private service: T,
  ) { }

  public static getDB (): Dexie {
    CloudSyncBase.initDB()
    return CloudSyncBase.DB!
  }

  public async getLinkedFileIdOrNull (projectId: string | undefined): Promise<string | null> {
    if (!projectId) {
      return null
    }
    CloudSyncBase.initDB()
    return (await CloudSyncBase.DB!.table<ICloudSyncDB<SupportedCloud.DROPBOX>['filesInfo']>(CloudSyncTable.FILES_INFO).get({ projectId }))?.fileId ?? null
  }

  protected async setRemoteId (remoteId: string) {
    const currentProject = Bucket.general.get(ProjectAtoms.currentProject)!

    if (!currentProject) {
      return
    }
    await CloudSyncBase.DB!.table<ICloudSyncDB<SupportedCloud.DROPBOX>['filesInfo']>(CloudSyncTable.FILES_INFO).put({ projectId: currentProject.getId(), fileId: remoteId })
    Manager.loadProjectById(currentProject.getId())
  }

  public static async clearRemoteId (projectId: string) {
    await CloudSyncBase.DB!.table<ICloudSyncDB<SupportedCloud.DROPBOX>['filesInfo']>(CloudSyncTable.FILES_INFO).delete(projectId)
  }

  protected static initDB () {
    if (!CloudSyncBase.DB) {
      CloudSyncBase.DB = new Dexie('CloudSync')
      CloudSyncBase.DB.version(DB_VERSION).stores({
        [CloudSyncTable.ACCOUNTS]: 'service',
        [CloudSyncTable.SYNC_INFO]: 'projectId',
        [CloudSyncTable.FILES_INFO]: 'projectId',
        [CloudSyncTable.REMOTES_INFO]: 'remoteId',
        [CloudSyncTable.REMOTE_PROJECTS]: 'projectId, remoteId',
      })
    }
  }

  public storeDataForService = (data: TDataForTable<T>, idToUse?: string) => (
    CloudSyncBase.DB!.table<ICloudSyncDB<T>['accounts']>(CloudSyncTable.ACCOUNTS).put({ ...data, service: idToUse || this.service } as TAccountsTable<T>)
  )

  protected getDataForService (idToUse?: string): Promise<ICloudSyncDB<T>['accounts'] | undefined> {
    return CloudSyncBase.DB!.table<ICloudSyncDB<T>['accounts']>(CloudSyncTable.ACCOUNTS).get({ service: idToUse || this.service })
  }

  /**
   * Stores the time of the last successful sync of a project.
   * @param lastSync defaults to now; pass the time the sync started to never miss changes made while syncing.
   */
  public async setLastSync (projectId: string, lastSync: string = DateTools.getUtcIsoString()) {
    return CloudSyncBase.DB!.table<ICloudSyncDB<T>['syncInfo']>(CloudSyncTable.SYNC_INFO).put({ projectId, lastSync })
  }

  public static async getLastSync <T extends SupportedCloud> (projectId: string): Promise<string | undefined> {
    CloudSyncBase.initDB()
    return (await CloudSyncBase.DB!.table<ICloudSyncDB<T>['syncInfo']>(CloudSyncTable.SYNC_INFO).get({ projectId }))?.lastSync
  }

  public static async deleteLastSync <T extends SupportedCloud> (projectId: string): Promise<void> {
    return CloudSyncBase.DB!.table<ICloudSyncDB<T>['syncInfo']>(CloudSyncTable.SYNC_INFO).delete(projectId)
  }

  protected async saveRemoteInfo (remoteId: string, data: IWordPressSpaceInfo, needsReauth = false) {
    return CloudSyncBase.DB!.table<ICloudSyncDB<T>['remotesInfo']>(CloudSyncTable.REMOTES_INFO).put({ remoteId, data, needsReauth })
  }

  protected async setRemoteNeedsReauth (remoteId: string, needsReauth: boolean) {
    return CloudSyncBase.DB!.table<ICloudSyncDB<T>['remotesInfo']>(CloudSyncTable.REMOTES_INFO).update(remoteId, { needsReauth })
  }

  protected async deleteRemoteInfo (remoteId: string) {
    await CloudSyncBase.DB!.table<ICloudSyncDB<T>['remotesInfo']>(CloudSyncTable.REMOTES_INFO).delete(remoteId)
    await CloudSyncBase.DB!.table<ICloudSyncDB<T>['accounts']>(CloudSyncTable.ACCOUNTS).delete(remoteId)
  }

  public static async getRemoteProjectInfo (projectId: string): Promise<IRemoteProjectInfo | undefined> {
    CloudSyncBase.initDB()
    return CloudSyncBase.DB!.table<IRemoteProjectInfo>(CloudSyncTable.REMOTE_PROJECTS).get(projectId)
  }

  public static async getRemoteProjectsInfo (remoteId: string): Promise<Array<IRemoteProjectInfo>> {
    CloudSyncBase.initDB()
    return CloudSyncBase.DB!.table<IRemoteProjectInfo>(CloudSyncTable.REMOTE_PROJECTS).where('remoteId').equals(remoteId).toArray()
  }

  public static async saveRemoteProjectInfo (info: IRemoteProjectInfo): Promise<void> {
    CloudSyncBase.initDB()
    await CloudSyncBase.DB!.table<IRemoteProjectInfo>(CloudSyncTable.REMOTE_PROJECTS).put(info)
  }

  public static async deleteRemoteProjectInfo (projectId: string): Promise<void> {
    CloudSyncBase.initDB()
    await CloudSyncBase.DB!.table<IRemoteProjectInfo>(CloudSyncTable.REMOTE_PROJECTS).delete(projectId)
  }

  public async getAllRemotesInfo (): Promise<Array<ICloudSyncDB<T>['remotesInfo']>> {
    return CloudSyncBase.DB!.table<ICloudSyncDB<T>['remotesInfo']>(CloudSyncTable.REMOTES_INFO).toArray()
  }

  public async getRemoteInfo (remoteId: string): Promise<ICloudSyncDB<T>['remotesInfo'] | undefined> {
    return CloudSyncBase.DB!.table<ICloudSyncDB<T>['remotesInfo']>(CloudSyncTable.REMOTES_INFO).get(remoteId)
  }

  protected async getAllAccounts (): Promise<Array<ICloudSyncDB<T>['accounts']>> {
    return CloudSyncBase.DB!.table<ICloudSyncDB<T>['accounts']>(CloudSyncTable.ACCOUNTS).toArray()
  }
}
