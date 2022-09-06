import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { AdditionalInfoForLocalStorage, LocalProjectSettings, IProjectSettings } from 'app/models/project/project.declarations'
import { CLIENT_SECTIONS } from 'app/data/system-local-db/client-sections.enum'

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
    this.doStoreProjectSettings()

    return this.copyOfProjectSettings!
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
