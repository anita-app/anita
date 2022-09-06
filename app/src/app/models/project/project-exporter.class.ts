import { dbInstances } from 'app/data/local-dbs/db-instances.const'
import { TAnitaUniversalDataStorage } from 'app/models/project/project.declarations'
import { ISectionElement } from 'app/models/section-element/section-element.declarations'
import { FsHelper } from 'app/libs/db-connector/plugins/file-handles/helpers/fs-helper'

export enum ExportScope {
  all,
  dataOnly,
  structureOnly
}

export class ProjectExporter {
  private jsonData: string = ''
  private projectToExport: Partial<TAnitaUniversalDataStorage> = {}

  constructor (
    private systemData: Partial<TAnitaUniversalDataStorage>
  ) {}

  /**
   * Retrieves the data and saves it as a file on the device
   */
  public async export (scope: ExportScope): Promise<void> {
    if (scope !== ExportScope.dataOnly) {
      this.addSystemDataToProjectToExport()
    }
    if (scope !== ExportScope.structureOnly) {
      await this.getSectionsData()
    }
    this.convertToJson()
    FsHelper.download(this.jsonData, `${this.systemData._settings?.[0].title}.json`, 'text/plain')
  }

  private addSystemDataToProjectToExport (): void {
    this.projectToExport = {
      ...this.systemData
    }
  }

  /**
   * Loop all sections
   */
  private async getSectionsData (): Promise<void> {
    for (const section of this.systemData._sections || []) {
      await this.getSectionData(section.id)
    }
  }

  /**
   * Retrieve the data of each section and add it to the object to export
   */
  private async getSectionData (sectionId: string): Promise<void> {
    const data = await dbInstances[this.systemData._settings?.[0].id!].callSelector<ISectionElement>(sectionId).multiple() || []
    this.projectToExport[sectionId] = data
  }

  /**
   * Data is exported in JSON
   */
  private convertToJson (): void {
    this.jsonData = JSON.stringify(this.projectToExport, null, 2)
  }
}
