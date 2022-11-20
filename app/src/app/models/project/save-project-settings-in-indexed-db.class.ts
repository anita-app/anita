import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { AdditionalInfoForLocalStorage, LocalProjectSettings, IProjectSettings } from 'app/models/project/project.declarations'
import { CLIENT_SECTIONS } from 'app/data/system-local-db/client-sections.enum'
import { LOCAL_STORAGE_SYSTEMS } from 'app/data/local-dbs/local-storage-systems.enum'

/**
 * Saves project's settings in IndexedDB.
 */
export class SaveProjectSettingsInIndexedDB {
  /**
   * Copy of the settings of the project to be saved in IndexedDB
   */
  private copyOfProjectSettings: LocalProjectSettings | undefined

  /**
   * Creates an instance of save project settings in indexed db.
   * @param projectSettings settings Object of the project to store
   * @param fileHandle handle of the file on disk. Saved in the IndexedDB for future use
   */
  constructor (
    private projectSettings: IProjectSettings,
    private localSettingAdditionalKeys: AdditionalInfoForLocalStorage
  ) { }

  /**
   * Saves the project settings in IndexedDB with its additional keys for handling local storage
   * @returns save
   */
  public async save (): Promise<LocalProjectSettings> {
    this.setProjectSettingsCloneWithAdditionalKeys()
    this.checkIfLocalStorageIsSetOrGetIt()
    this.doStoreProjectSettings()

    return this.copyOfProjectSettings!
  }

  /**
   * Checks if `localStorage` is set in the project settings. If not, it gets it from the local storage
   * `localStorage` could be undefined if the settings are being updated by the remote sync
   */
  private async checkIfLocalStorageIsSetOrGetIt (): Promise<void> {
    if (!this.copyOfProjectSettings!.localStorage) {
      this.copyOfProjectSettings!.localStorage = await this.getLocalStorage()
    }
  }

  /**
   * Gets the `localStorage` system from the local system db. It is safe to assume that the local storage system is set
   */
  private getLocalStorage (): Promise<LOCAL_STORAGE_SYSTEMS> {
    return dbInstances.system.callSelector<IProjectSettings>(CLIENT_SECTIONS.projects, { id: this.projectSettings.id }).single().then((projectSettings) => projectSettings!.localStorage!)
  }

  /**
   * Deep clonse settings and then adds the fileHandle to prevent setting the fileHandle on the project data object
   */
  private setProjectSettingsCloneWithAdditionalKeys (): void {
    this.copyOfProjectSettings = { ...this.projectSettings, ...this.localSettingAdditionalKeys }
  }

  /**
   * Stores the project settings with db-connector
   */
  private doStoreProjectSettings (): void {
    dbInstances.system.callInsertor(CLIENT_SECTIONS.projects, this.copyOfProjectSettings).autoInsert()
  }
}
