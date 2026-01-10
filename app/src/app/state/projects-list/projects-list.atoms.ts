import { atom } from 'jotai'
import type { LocalProjectSettings } from 'app/models/project/project.declarations'

export class ProjectsListAtoms {
  public static projects = atom<Array<LocalProjectSettings>>([])
}
