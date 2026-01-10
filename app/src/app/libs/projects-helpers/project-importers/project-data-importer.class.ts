import { DbInitializer } from 'app/data/local-dbs/db-initializer.class'
import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { LOCAL_STORAGE_SYSTEMS } from 'app/data/local-dbs/local-storage-systems.enum'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { SaveProjectSettingsInIndexedDB } from 'app/models/project/save-project-settings-in-indexed-db.class'
import type { AdditionalInfoForLocalStorage, TAnitaUniversalDataStorage, LocalProjectSettings } from 'app/models/project/project.declarations'

/**
 * Imports a project payload and persists it to IndexedDB.
 */
export class ProjectDataImporter {
  private additionalInfoForLocalStorage!: AdditionalInfoForLocalStorage

  /**
   * @param projectData The project data to import
   */
  constructor (
    private projectData: TAnitaUniversalDataStorage,
  ) { }

  /**
   * Initializes the project DB and stores the data.
   */
  public async import (): Promise<LocalProjectSettings> {
    this.projectData[RESERVED_AUDS_KEYS._settings][0].localStorage = LOCAL_STORAGE_SYSTEMS.IndexedDB
    await this.initializeDb()
    await this.setLocalProjectSettings()
    await this.saveDataToDb()

    return { ...this.projectData[RESERVED_AUDS_KEYS._settings][0], ...this.additionalInfoForLocalStorage }
  }

  private async setLocalProjectSettings () {
    this.additionalInfoForLocalStorage = await dbInstances[this.projectData[RESERVED_AUDS_KEYS._settings][0].id].dbStore.postProjectCreation?.(this.projectData) || {}
    await new SaveProjectSettingsInIndexedDB(this.projectData[RESERVED_AUDS_KEYS._settings][0], this.additionalInfoForLocalStorage).save()
  }

  /**
   * Initialize the DbConnector instance
   */
  private async initializeDb (): Promise<void> {
    await new DbInitializer(this.projectData[RESERVED_AUDS_KEYS._settings][0], this.projectData[RESERVED_AUDS_KEYS._sections]).init()
  }

  private async saveDataToDb (): Promise<void> {
    for (const section in this.projectData) {
      await dbInstances[this.projectData[RESERVED_AUDS_KEYS._settings][0].id].callInsertor(section, this.projectData[section]).autoInsert()
    }
  }
}
