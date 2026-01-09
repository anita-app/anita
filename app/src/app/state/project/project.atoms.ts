import { atom } from 'jotai'
import { TSystemData } from 'app/models/project/project.declarations'

export class ProjectAtoms {
  public static current = atom<TSystemData | null>(null)
}
