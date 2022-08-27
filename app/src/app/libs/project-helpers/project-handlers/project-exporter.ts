import { dbInstances } from 'app/data/local-dbs/db-instances.const';
import { AnitaUniversalDataStorage, SectionElement } from 'app/data/project-structure/project-info';
import { FsHelper } from 'app/libs/db-connector/plugins/file-handles/helpers/fs-helper';
import { Logger } from 'app/libs/logger/logger.class';
import { store } from 'app/libs/redux/state.store';

export class ProjectExporter {

  private jsonData: string

  constructor(
    private projectToExport: AnitaUniversalDataStorage
  ) {}

  public static export(): void {
    const projectSystemData = store.getState().project
    if (projectSystemData) {
      new ProjectExporter(projectSystemData).doExport()
    } else {
      Logger.error('[ProjectExporter]: export called when no project is loaded')
    }
  }

  private async doExport(): Promise<void> {
    await this.getSectionsData()
    this.convertToJson()
    FsHelper.download(this.jsonData, `${this.projectToExport._settings[0].title}.json`, 'text/plain')
  }

  private async getSectionsData(): Promise<void> {
    for (const section of this.projectToExport._sections) {
      await this.getSectionData(section.id)
    }
  }

  private async getSectionData(sectionId: string): Promise<void> {
    const data = await dbInstances[this.projectToExport._settings[0].id].callSelector<SectionElement>(sectionId).multiple() || []
    this.projectToExport[sectionId] = data
  }

  private convertToJson(): void {
    this.jsonData = JSON.stringify(this.projectToExport, null, 2)
  }
  

}