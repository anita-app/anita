import { DbInitializer } from 'app/data/local-dbs/db-initializer.class'
import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { RESERVED_AUDS_KEYS, SystemData } from 'app/data/project-structure/project-info'
import { SaveProjectSettingsInIndexedDB } from 'app/libs/project-helpers/project-handlers/save-project-settings-in-indexeddb.class'
import { EDITOR_MODE } from 'app/ui-react-components/editor-mode.enum'

export class ProjectSaver {

  constructor(
    private project: SystemData = {
      [RESERVED_AUDS_KEYS._settings]: [],
      [RESERVED_AUDS_KEYS._sections]: []
    },
    private mode: EDITOR_MODE

  ) { }

  public async save(): Promise<SystemData> {

    this.setcreatedAt();

    if (this.mode === EDITOR_MODE.edit)
      this.setupdatedAt();

    if (!dbInstances[this.project[RESERVED_AUDS_KEYS._settings][0].id])
      await this.initDbInstance();


    await this.saveSettings();
    await this.saveSections();

    await this.postSaveActions();

    return this.project;
  }

  private setcreatedAt(): void {
    this.project[RESERVED_AUDS_KEYS._settings][0].createdAt = new Date(new Date().toUTCString()).toISOString();
  }

  private setupdatedAt(): void {
    this.project[RESERVED_AUDS_KEYS._settings][0].updatedAt = new Date(new Date().toUTCString()).toISOString();
  }

  private async initDbInstance(): Promise<void> {
    await new DbInitializer(this.project[RESERVED_AUDS_KEYS._settings][0], this.project[RESERVED_AUDS_KEYS._sections]).init();
  }

  private async saveSettings(): Promise<void> {
    await dbInstances[this.project[RESERVED_AUDS_KEYS._settings][0].id].callInsertor(RESERVED_AUDS_KEYS._settings, this.project[RESERVED_AUDS_KEYS._settings][0]).autoInsert();
  }

  private async saveSections(): Promise<void> {
    await dbInstances[this.project[RESERVED_AUDS_KEYS._settings][0].id].callDeletor(RESERVED_AUDS_KEYS._sections).clearSection();
    await dbInstances[this.project[RESERVED_AUDS_KEYS._settings][0].id].callInsertor(RESERVED_AUDS_KEYS._sections, this.project[RESERVED_AUDS_KEYS._sections]).autoInsert();
  }

  private async postSaveActions(): Promise<void> {
    const methodName = this.mode === EDITOR_MODE.add ? 'postProjectCreation' : 'postProjectUpdate';
    const payload = await dbInstances[this.project[RESERVED_AUDS_KEYS._settings][0].id].dbStore[methodName]?.(this.project) || {};

    await new SaveProjectSettingsInIndexedDB(this.project[RESERVED_AUDS_KEYS._settings][0], payload).save();

  }

}
