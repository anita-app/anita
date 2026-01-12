import { atom } from 'jotai'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { Project } from 'app/models/project/project.class'
import type { TSystemData } from 'app/models/project/project.declarations'

export class ProjectAtoms {
  public static currentSystemData = atom<TSystemData | null>(null)
  public static projectId = atom<string | null>(get => get(this.currentSystemData)?.[RESERVED_AUDS_KEYS._settings]?.[0]?.id ?? null)

  public static currentProject = atom<Project | null>(get => {
    const systemData = get(this.currentSystemData)
    if (!systemData) {
      return null
    }
    return new Project(systemData)
  })

  public static projectSettings = atom(get => {
    const systemData = get(this.currentSystemData)
    if (!systemData) {
      return null
    }
    return systemData[RESERVED_AUDS_KEYS._settings][0]
  })
}
