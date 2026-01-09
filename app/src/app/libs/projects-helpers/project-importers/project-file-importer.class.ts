import { TAnitaUniversalDataStorage } from 'app/models/project/project.declarations'
import fileDialog from 'file-dialog'

/**
 * Imports an existing project file from disk.
 */
export class ProjectFileImporter {
  private projectData: TAnitaUniversalDataStorage | undefined

  /**
   * Asks for the file to import and returns the project data.
   */
  public async import (): Promise<{ project: TAnitaUniversalDataStorage } | void> {
    const files = await fileDialog({ multiple: false, accept: 'application/json,text/json' })
    if (!files?.length) {
      return
    }
    const fileContents = await files[0].text()
    if (!fileContents) {
      return
    }
    this.projectData = JSON.parse(fileContents)
    return { project: this.projectData! }
  }
}
