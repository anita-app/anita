import { Bucket } from 'app/state/bucket.state'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { TSystemData } from 'app/models/project/project.declarations'
import { ISection } from 'app/models/section/section.declarations'

export class ProjectState {
  public static setCurrentProject = (systemData: TSystemData) => {
    Bucket.general.set(ProjectAtoms.currentSystemData, systemData)
  }

  public static resetCurrentProject = () => {
    Bucket.general.set(ProjectAtoms.currentSystemData, null)
  }

  public static getCurrentProject = (): TSystemData | null => (
    Bucket.general.get(ProjectAtoms.currentSystemData)
  )

  public static updateSection = (section: ISection) => {
    const current = Bucket.general.get(ProjectAtoms.currentSystemData)
    if (!current || !current._sections) {
      return
    }

    const sectionIndex = current._sections.findIndex(entry => entry.id === section.id)
    if (sectionIndex < 0) {
      return
    }

    const updatedSections = current._sections.slice()
    updatedSections[sectionIndex] = section
    Bucket.general.set(ProjectAtoms.currentSystemData, { ...current, _sections: updatedSections })
  }
}
