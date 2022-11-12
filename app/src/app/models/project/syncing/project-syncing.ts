import { DropboxHelper } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'
import { ProjectExporter, ExportScope } from 'app/models/project/project-exporter.class'
import { TAnitaUniversalDataStorage } from 'app/models/project/project.declarations'

export class ProjectSyncing {
  private projectInJson: string | undefined
  private fileName: string | undefined

  constructor (
    private systemData: Partial<TAnitaUniversalDataStorage>
  ) {
    this.fileName = `${this.systemData._settings?.[0].title}.json`
  }

  public async uploadToCloudService (path: string): Promise<void> {
    this.projectInJson = await new ProjectExporter(this.systemData).getAsJson(ExportScope.all)
    DropboxHelper.instance.uploadFile(path, this.fileName!, this.projectInJson)
  }
}
