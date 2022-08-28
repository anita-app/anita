import { dbInstances } from 'app/data/local-dbs/db-instances.const';
import { AnitaUniversalDataStorage, SectionElement } from 'app/data/project-structure/project-info';
import { FsHelper } from 'app/libs/db-connector/plugins/file-handles/helpers/fs-helper';

export class ProjectExporter {

  private jsonData: string

  constructor(
    private projectToExport: Partial<AnitaUniversalDataStorage>
  ) {}

  /**
   * Retrieves the data and saves it as a file on the device
   */
   public async export(): Promise<void> {
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