import { DbInitializer } from 'app/data/local-dbs/db-initializer.class'
import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { RESERVED_AUDS_KEYS, TSystemData } from 'app/models/project/project.declarations'
import { SaveProjectSettingsInIndexedDB } from 'app/models/project/save-project-settings-in-indexed-db.class'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { DateTools } from 'app/libs/tools/date-tools.class'
import { RESERVED_FIELDS } from 'app/models/reserved-fields.constant'

export class ProjectSaver {
  constructor (
    private project: TSystemData = {
      [RESERVED_AUDS_KEYS._settings]: [],
      [RESERVED_AUDS_KEYS._sections]: []
    },
    private mode: EDITOR_MODE

  ) { }

  public async save (): Promise<TSystemData> {
    if (this.mode === EDITOR_MODE.edit) {
      this.setupdatedAt()
    } else {
      this.setcreatedAt()
    }

    if (!dbInstances[this.project[RESERVED_AUDS_KEYS._settings][0].id]) {
      await this.initDbInstance()
    }

    await this.saveSettings()
    await this.saveSections()

    await this.postSaveActions()

    return this.project
  }

  private setcreatedAt (): void {
    this.project[RESERVED_AUDS_KEYS._settings][0][RESERVED_FIELDS.createdAt] = DateTools.getUtcIsoString()
  }

  private setupdatedAt (): void {
    this.project[RESERVED_AUDS_KEYS._settings][0][RESERVED_FIELDS.updatedAt] = DateTools.getUtcIsoString()
  }

  private async initDbInstance (): Promise<void> {
    await new DbInitializer(this.project[RESERVED_AUDS_KEYS._settings][0], this.project[RESERVED_AUDS_KEYS._sections]).init()
  }

  private async saveSettings (): Promise<void> {
    await dbInstances[this.project[RESERVED_AUDS_KEYS._settings][0].id].callInsertor(RESERVED_AUDS_KEYS._settings, this.project[RESERVED_AUDS_KEYS._settings][0]).autoInsert()
  }

  private async saveSections (): Promise<void> {
    await dbInstances[this.project[RESERVED_AUDS_KEYS._settings][0].id].callDeletor(RESERVED_AUDS_KEYS._sections).clearSection()
    await dbInstances[this.project[RESERVED_AUDS_KEYS._settings][0].id].callInsertor(RESERVED_AUDS_KEYS._sections, this.project[RESERVED_AUDS_KEYS._sections]).autoInsert()
  }

  private async postSaveActions (): Promise<void> {
    const methodName = this.mode === EDITOR_MODE.add ? 'postProjectCreation' : 'postProjectUpdate'
    const payload = await dbInstances[this.project[RESERVED_AUDS_KEYS._settings][0].id].dbStore[methodName]?.(this.project) || {}

    await new SaveProjectSettingsInIndexedDB(this.project[RESERVED_AUDS_KEYS._settings][0], payload).save()
  }
}
