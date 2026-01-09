import { atom } from 'jotai'
import { RESERVED_AUDS_KEYS, TSystemData } from 'app/models/project/project.declarations'
import { Project } from 'app/models/project/project.class'
import { ISection } from 'app/models/section/section.declarations'
import { Section } from 'app/models/section/section.class'
import { atomFamily } from 'jotai-family'

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

  private static sectionsDefinitionsById = atom<Record<string, ISection>>(get => {
    const systemData = get(this.currentSystemData)
    if (!systemData) {
      return {}
    }
    const sectionsDefinitionsById: Record<string, ISection> = {}
    const sections = systemData[RESERVED_AUDS_KEYS._sections]
    for (const section of sections) {
      sectionsDefinitionsById[section.id] = section
    }
    return sectionsDefinitionsById
  })

  public static sectionById = atomFamily((sectionId?: string) => atom(get => {
    if (!sectionId) {
      return null
    }
    const projectId = get(this.projectId)
    if (!projectId) {
      return null
    }
    const sectionDefinition = get(this.sectionsDefinitionsById)[sectionId]
    if (!sectionDefinition) {
      return null
    }
    const section = new Section(
      projectId,
      sectionDefinition
    )
    return section
  }))
}
