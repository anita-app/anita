import { Bucket } from 'app/state/bucket.state'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import type { TSystemData } from 'app/models/project/project.declarations'
import type { ISection } from 'app/models/section/section.declarations'

const LAST_PROJECT_KEY = 'anita.lastProjectId'

/** @featurePart navigation.reopen-last-project */
export class ProjectState {
  public static setCurrentProject = (systemData: TSystemData) => {
    Bucket.general.set(ProjectAtoms.currentSystemData, systemData)
    ProjectState.rememberLastProject(systemData?._settings?.[0]?.id ?? null)
  }

  public static resetCurrentProject = () => {
    Bucket.general.set(ProjectAtoms.currentSystemData, null)
    ProjectState.rememberLastProject(null)
  }

  /**
   * The project opened last on this device, reopened when the app starts on a page that is not a project's.
   */
  public static getLastProjectId = (): string | null => {
    try {
      return localStorage.getItem(LAST_PROJECT_KEY)
    } catch {
      return null
    }
  }

  private static rememberLastProject = (projectId: string | null) => {
    try {
      if (projectId) {
        localStorage.setItem(LAST_PROJECT_KEY, projectId)
      } else {
        localStorage.removeItem(LAST_PROJECT_KEY)
      }
    } catch {
      // Storage disabled: the first project is reopened instead.
    }
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
