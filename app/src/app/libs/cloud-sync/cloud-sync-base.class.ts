import { DateTools } from 'app/libs/tools/date-tools.class'
import Dexie from 'dexie'
import { CloudSyncTable } from './cloud-sync.const'
import type { IRemoteProjectInfo, IWordPressAuthData, IWordPressRemoteInfo, IWordPressSpaceInfo } from 'app/libs/cloud-sync/wordpress/wordpress.const'
import type { IDropboxAccountData, IDropboxFileLink, IDropboxIgnoredFile } from 'app/libs/cloud-sync/dropbox/dropbox.const'
import type { ILocalFileLink } from 'app/libs/cloud-sync/local-file/local-file.const'

const DB_VERSION = 9

/** @internal */
export enum SupportedCloud {
  DROPBOX = 'dropbox',
  WORDPRESS = 'wordpress',
  LOCAL_FILE = 'localFile',
}

interface IAccountsTableForDropbox extends IDropboxAccountData {
  service: SupportedCloud
}

interface IAccountsTableForWordpress extends IWordPressAuthData {
  service: SupportedCloud
}

type TDataForTable<T extends SupportedCloud> = T extends SupportedCloud.DROPBOX ? IDropboxAccountData : IWordPressAuthData

type TAccountsTable<T extends SupportedCloud> = T extends SupportedCloud.DROPBOX ? IAccountsTableForDropbox : IAccountsTableForWordpress

interface ICloudSyncDB<T extends SupportedCloud> {
  [CloudSyncTable.ACCOUNTS]: TAccountsTable<T>
  [CloudSyncTable.SYNC_INFO]: {
    projectId: string
    lastSync: string
  }
  /** The Dropbox file each project is synced with. */
  [CloudSyncTable.FILES_INFO]: IDropboxFileLink
  [CloudSyncTable.REMOTES_INFO]: IWordPressRemoteInfo
  [CloudSyncTable.REMOTE_PROJECTS]: IRemoteProjectInfo
  /** Dropbox files of projects deleted only from this device: they are not downloaded again automatically. */
  [CloudSyncTable.IGNORED_FILES]: IDropboxIgnoredFile
  /** The file on this computer each project is synced with. */
  [CloudSyncTable.LOCAL_FILES]: ILocalFileLink
}

/** @internal */
export class CloudSyncBase<T extends SupportedCloud> {
  private static DB: Dexie | undefined
  constructor (
    private service: T,
  ) { }

  public static getDB (): Dexie {
    CloudSyncBase.initDB()
    return CloudSyncBase.DB!
  }

  public static async getDropboxLink (projectId: string | undefined): Promise<IDropboxFileLink | undefined> {
    if (!projectId) {
      return undefined
    }
    CloudSyncBase.initDB()
    return CloudSyncBase.DB!.table<IDropboxFileLink>(CloudSyncTable.FILES_INFO).get(projectId)
  }

  public static async getDropboxLinks (): Promise<Array<IDropboxFileLink>> {
    CloudSyncBase.initDB()
    return CloudSyncBase.DB!.table<IDropboxFileLink>(CloudSyncTable.FILES_INFO).toArray()
  }

  public static async saveDropboxLink (link: IDropboxFileLink): Promise<void> {
    CloudSyncBase.initDB()
    await CloudSyncBase.DB!.table<IDropboxFileLink>(CloudSyncTable.FILES_INFO).put(link)
  }

  public static async updateDropboxLink (projectId: string, changes: Partial<IDropboxFileLink>): Promise<void> {
    CloudSyncBase.initDB()
    await CloudSyncBase.DB!.table<IDropboxFileLink>(CloudSyncTable.FILES_INFO).update(projectId, changes)
  }

  public static async deleteDropboxLink (projectId: string): Promise<void> {
    CloudSyncBase.initDB()
    await CloudSyncBase.DB!.table<IDropboxFileLink>(CloudSyncTable.FILES_INFO).delete(projectId)
  }

  public static async getIgnoredDropboxFileIds (): Promise<Set<string>> {
    CloudSyncBase.initDB()
    const ignored = await CloudSyncBase.DB!.table<IDropboxIgnoredFile>(CloudSyncTable.IGNORED_FILES).toArray()
    return new Set(ignored.map(file => file.fileId))
  }

  public static async ignoreDropboxFile (file: IDropboxIgnoredFile): Promise<void> {
    CloudSyncBase.initDB()
    await CloudSyncBase.DB!.table<IDropboxIgnoredFile>(CloudSyncTable.IGNORED_FILES).put(file)
  }

  public static async unignoreDropboxFile (fileId: string): Promise<void> {
    CloudSyncBase.initDB()
    await CloudSyncBase.DB!.table<IDropboxIgnoredFile>(CloudSyncTable.IGNORED_FILES).delete(fileId)
  }

  public static async getLocalFileLink (projectId: string | undefined): Promise<ILocalFileLink | undefined> {
    if (!projectId) {
      return undefined
    }
    CloudSyncBase.initDB()
    return CloudSyncBase.DB!.table<ILocalFileLink>(CloudSyncTable.LOCAL_FILES).get(projectId)
  }

  public static async getLocalFileLinks (): Promise<Array<ILocalFileLink>> {
    CloudSyncBase.initDB()
    return CloudSyncBase.DB!.table<ILocalFileLink>(CloudSyncTable.LOCAL_FILES).toArray()
  }

  public static async saveLocalFileLink (link: ILocalFileLink): Promise<void> {
    CloudSyncBase.initDB()
    await CloudSyncBase.DB!.table<ILocalFileLink>(CloudSyncTable.LOCAL_FILES).put(link)
  }

  public static async updateLocalFileLink (projectId: string, changes: Partial<ILocalFileLink>): Promise<void> {
    CloudSyncBase.initDB()
    await CloudSyncBase.DB!.table<ILocalFileLink>(CloudSyncTable.LOCAL_FILES).update(projectId, changes)
  }

  public static async deleteLocalFileLink (projectId: string): Promise<void> {
    CloudSyncBase.initDB()
    await CloudSyncBase.DB!.table<ILocalFileLink>(CloudSyncTable.LOCAL_FILES).delete(projectId)
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
        [CloudSyncTable.IGNORED_FILES]: 'fileId',
        [CloudSyncTable.LOCAL_FILES]: 'projectId',
      })
    }
  }

  public storeDataForService = (data: TDataForTable<T>, idToUse?: string) => (
    CloudSyncBase.DB!.table<ICloudSyncDB<T>['accounts']>(CloudSyncTable.ACCOUNTS).put({ ...data, service: idToUse || this.service } as TAccountsTable<T>)
  )

  protected deleteDataForService (idToUse?: string): Promise<void> {
    return CloudSyncBase.DB!.table<ICloudSyncDB<T>['accounts']>(CloudSyncTable.ACCOUNTS).delete(idToUse || this.service)
  }

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
    CloudSyncBase.initDB()
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
