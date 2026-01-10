import { DbInitializer } from 'app/data/local-dbs/db-initializer.class'
import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { SaveProjectSettingsInIndexedDB } from 'app/models/project/save-project-settings-in-indexed-db.class'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { DateTools } from 'app/libs/tools/date-tools.class'
import { RESERVED_FIELDS } from 'app/models/reserved-fields.constant'
import { LOCAL_STORAGE_SYSTEMS } from 'app/data/local-dbs/local-storage-systems.enum'
import { SyncManager } from 'app/cross-refs-exports'
import { SyncState } from 'app/state/sync/sync-state.class'
import type { ISyncWithRemoteOrLocalAddProjectProps, ISyncWithRemoteOrLocalEditProjectProps } from 'app/cross-refs-exports'
import type { TSystemData } from 'app/models/project/project.declarations'

export class ProjectSaver {
  private localStorage: LOCAL_STORAGE_SYSTEMS | undefined
  constructor (
    private project: TSystemData = {
      [RESERVED_AUDS_KEYS._settings]: [],
      [RESERVED_AUDS_KEYS._sections]: [],
    },
    private mode: EDITOR_MODE.add | EDITOR_MODE.edit,

  ) { }

  public async save (): Promise<TSystemData> {
    SyncState.setIsSavingInFs(true)

    if (this.mode === EDITOR_MODE.edit) {
      this.setUpdatedAt()
    } else {
      this.setCreatedAt()
    }

    await this.checkIfLocalStorageIsSetOrGetIt()

    if (!dbInstances[this.project[RESERVED_AUDS_KEYS._settings][0].id]) {
      await this.initDbInstance()
    }

    await this.saveSettings()

    await this.saveSections()

    await this.postSaveActions()

    const payload = this.mode === EDITOR_MODE.add
      ? { mode: this.mode, type: 'project', systemData: this.project } as ISyncWithRemoteOrLocalAddProjectProps
      : { mode: this.mode, type: 'project' } as ISyncWithRemoteOrLocalEditProjectProps

    SyncManager.syncWithRemoteOrLocal(payload)

    return this.project
  }

  private setCreatedAt (): void {
    this.project[RESERVED_AUDS_KEYS._settings][0][RESERVED_FIELDS.createdAt] = DateTools.getUtcIsoString()
    this.project[RESERVED_AUDS_KEYS._sections].forEach((section) => {
      section[RESERVED_FIELDS.createdAt] = DateTools.getUtcIsoString()
    })
  }

  private setUpdatedAt (): void {
    this.project[RESERVED_AUDS_KEYS._settings][0][RESERVED_FIELDS.updatedAt] = DateTools.getUtcIsoString()
    this.project[RESERVED_AUDS_KEYS._sections].forEach((section) => {
      section[RESERVED_FIELDS.updatedAt] = DateTools.getUtcIsoString()
    })
  }

  /**
   * Forces the local storage system to IndexedDB.
   */
  private async checkIfLocalStorageIsSetOrGetIt (): Promise<void> {
    this.project[RESERVED_AUDS_KEYS._settings][0].localStorage = LOCAL_STORAGE_SYSTEMS.IndexedDB
  }

  private async initDbInstance (): Promise<void> {
    await new DbInitializer(this.project[RESERVED_AUDS_KEYS._settings][0], this.project[RESERVED_AUDS_KEYS._sections]).init()
  }

  private async saveSettings (): Promise<void> {
    const settingsClone = { ...this.project[RESERVED_AUDS_KEYS._settings][0] }
    this.localStorage = settingsClone.localStorage
    delete settingsClone.localStorage
    await dbInstances[this.project[RESERVED_AUDS_KEYS._settings][0].id].callInsertor(RESERVED_AUDS_KEYS._settings, settingsClone).autoInsert()
  }

  private async saveSections (): Promise<void> {
    await dbInstances[this.project[RESERVED_AUDS_KEYS._settings][0].id].callDeletor(RESERVED_AUDS_KEYS._sections).clearSection()
    await dbInstances[this.project[RESERVED_AUDS_KEYS._settings][0].id].callInsertor(RESERVED_AUDS_KEYS._sections, this.project[RESERVED_AUDS_KEYS._sections]).autoInsert()
  }

  private async postSaveActions (): Promise<void> {
    const methodName = this.mode === EDITOR_MODE.add ? 'postProjectCreation' : 'postProjectUpdate'
    const payload = await dbInstances[this.project[RESERVED_AUDS_KEYS._settings][0].id].dbStore[methodName]?.(this.project) || {}
    const settingsWithLocalStorage = { ...this.project[RESERVED_AUDS_KEYS._settings][0], localStorage: this.localStorage }
    await new SaveProjectSettingsInIndexedDB(settingsWithLocalStorage, payload).save()
  }
}
