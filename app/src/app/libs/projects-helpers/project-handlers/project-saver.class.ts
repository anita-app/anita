import { dbInstances } from '@anita/client/data/db-instances.const';
import { ProjectSettings, RESERVED_UDS_KEYS, SystemData } from '@anita/client/data/model/project-info';
import { DbConnector } from '@anita/client/libs/db-connector/db-connector.class';
import { FILE_HANDLES_PLUGIN } from '@anita/client/libs/db-connector/plugins/file-handles/exporter.constant';
import { asyncForEach } from '@anita/client/libs/tools/tools';
import { EDITOR_MODE } from '@anita/client/ui/editor-mode.enum';
import { SectionGenerator } from '@anita/client/ui/routed-views/projects/services/section-generator.class';
import { FormInfoForBuilder } from '@anita/client/ui/shared-components/forms-automator/form-builder/form-builder';
import { FormModel } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';

export class ProjectSaver {

  private projectDataToSave: SystemData = {
    [RESERVED_UDS_KEYS._settings]: [],
    [RESERVED_UDS_KEYS._sections]: []
  };

  constructor(
    private projctSettings: ProjectSettings,
    private dataStructureEles: Array<Array<Array<FormInfoForBuilder<FormModel>>>> = [],
    private mode: EDITOR_MODE

  ) { }

  public async save(): Promise<SystemData> {
    this.projectDataToSave[RESERVED_UDS_KEYS._settings].push(this.projctSettings);
    this.dataStructureEles.forEach(sectionEles => {
      this.projectDataToSave[RESERVED_UDS_KEYS._sections].push(new SectionGenerator(sectionEles).generate());
    });

    if (!dbInstances[this.projctSettings.id])
      await this.initDbInstance();

    await this.saveSettings();
    await this.saveSections();

    this.fileHandleOnlyActions();

    return this.projectDataToSave;
  }

  private async initDbInstance(): Promise<void> {
    dbInstances[this.projctSettings.id] = await new DbConnector(FILE_HANDLES_PLUGIN, { projectInfo: this.projctSettings }).init();
  }

  private async saveSettings(): Promise<void> {
    await dbInstances[this.projctSettings.id].callInsertor(RESERVED_UDS_KEYS._settings, this.projectDataToSave[RESERVED_UDS_KEYS._settings][0]).autoInsert();
  }

  private async saveSections(): Promise<void> {
    await asyncForEach(this.projectDataToSave[RESERVED_UDS_KEYS._sections], async section => await dbInstances[this.projctSettings.id].callInsertor(RESERVED_UDS_KEYS._sections, section).autoInsert());
  }

  private fileHandleOnlyActions(): Promise<void> {
    if (this.mode === EDITOR_MODE.add)
      return dbInstances[this.projctSettings.id].dbStore['initializeExistingProject']();
  }

}
