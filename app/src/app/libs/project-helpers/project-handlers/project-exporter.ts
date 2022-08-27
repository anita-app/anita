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

  /**
   * Ensures the SystemData is set in memory. If so, proceed with the logic.
   * @remarks Static method to invoke this from the UI
   */
  public static export(): void {
    const projectSystemData = store.getState().project
    if (projectSystemData) {
      new ProjectExporter(projectSystemData).doExport()
    } else {
      Logger.error('[ProjectExporter]: export called when no project is loaded')
    }
  }

  /**
   * Retrieves the data and saves it as a file on the device
   */
  private async doExport(): Promise<void> {
    await this.getSectionsData()
    this.convertToJson()
    FsHelper.download(this.jsonData, `${this.projectToExport._settings[0].title}.json`, 'text/plain')
  }

  /**
   * Loop all sections
   */
  private async getSectionsData(): Promise<void> {
    for (const section of this.projectToExport._sections) {
      await this.getSectionData(section.id)
    }
  }

  /**
   * Retrieve the data of each section and add it to the object to export
   */
  private async getSectionData(sectionId: string): Promise<void> {
    const data = await dbInstances[this.projectToExport._settings[0].id].callSelector<SectionElement>(sectionId).multiple() || []
    this.projectToExport[sectionId] = data
  }

  /**
   * Data is exported in JSON
   */
  private convertToJson(): void {
    this.jsonData = JSON.stringify(this.projectToExport, null, 2)
  }
  

}