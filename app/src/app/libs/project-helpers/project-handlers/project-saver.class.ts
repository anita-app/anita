import { dbInstances } from 'app/data/db-instances.const';
import { RESERVED_UDS_KEYS, SystemData } from 'app/data/model/project-info';
import { DbConnector } from 'app/libs/db-connector/db-connector.class';
import { FILE_HANDLES_PLUGIN } from 'app/libs/db-connector/plugins/file-handles/exporter.constant';
import { asyncForEach } from 'app/libs/tools/tools';
import { EDITOR_MODE } from 'app/ui-react-components/editor-mode.enum';

export class ProjectSaver {

  private projectDataToSave: SystemData = {
    [RESERVED_UDS_KEYS._settings]: [],
    [RESERVED_UDS_KEYS._sections]: []
  };

  constructor(
    private project: SystemData,
    private mode: EDITOR_MODE

  ) { }

  public async save(): Promise<SystemData> {
    this.projectDataToSave[RESERVED_UDS_KEYS._settings] = this.project[RESERVED_UDS_KEYS._settings].concat();
    this.projectDataToSave[RESERVED_UDS_KEYS._sections] = this.project[RESERVED_UDS_KEYS._sections].concat();

    this.setDateCreation();

    if (this.mode === EDITOR_MODE.edit)
      this.setLastModified();

    if (!dbInstances[this.projectDataToSave[RESERVED_UDS_KEYS._settings][0].id])
      await this.initDbInstance();

    await this.saveSettings();
    await this.saveSections();

    this.fileHandleOnlyActions();

    return this.projectDataToSave;
  }

  private setDateCreation(): void {
    this.projectDataToSave[RESERVED_UDS_KEYS._settings][0].dateCreation = new Date(new Date().toUTCString()).toISOString();
  }

  private setLastModified(): void {
    this.projectDataToSave[RESERVED_UDS_KEYS._settings][0].lastModified = new Date(new Date().toUTCString()).toISOString();
  }

  private async initDbInstance(): Promise<void> {
    dbInstances[this.projectDataToSave[RESERVED_UDS_KEYS._settings][0].id] = await new DbConnector(FILE_HANDLES_PLUGIN, { projectInfo: this.projectDataToSave[RESERVED_UDS_KEYS._settings][0] }).init();
  }

  private async saveSettings(): Promise<void> {
    await dbInstances[this.projectDataToSave[RESERVED_UDS_KEYS._settings][0].id].callInsertor(RESERVED_UDS_KEYS._settings, this.projectDataToSave[RESERVED_UDS_KEYS._settings][0]).autoInsert();
  }

  private async saveSections(): Promise<void> {
    await asyncForEach(this.projectDataToSave[RESERVED_UDS_KEYS._sections], async section => await dbInstances[this.projectDataToSave[RESERVED_UDS_KEYS._settings][0].id].callInsertor(RESERVED_UDS_KEYS._sections, section).autoInsert());
  }

  private fileHandleOnlyActions(): Promise<void> {
    if (this.mode === EDITOR_MODE.add)
      return dbInstances[this.projectDataToSave[RESERVED_UDS_KEYS._settings][0].id].dbStore['initializeExistingProject']();
  }

}
