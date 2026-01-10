import { Bucket } from 'app/state/bucket.state'
import { SectionsForChildOfSelectorAtoms } from 'app/state/sections-for-child-of-selector/sections-for-child-of-selector.atoms'
import type { SectionDetailsDeclaration } from 'app/models/section/section.declarations'

export class SectionsForChildOfSelectorState {
  public static addSection = (section: SectionDetailsDeclaration) => {
    const current = Bucket.general.get(SectionsForChildOfSelectorAtoms.sections)
    const next = current.slice()

    if (!next.length) {
      next.push(section)
    } else {
      const index = next.findIndex(sectionDeclaration => sectionDeclaration.id === section.id)
      const position = index >= 0 ? index : next.length
      next[position] = section
    }

    Bucket.general.set(SectionsForChildOfSelectorAtoms.sections, next)
  }

  public static reset = () => {
    Bucket.general.set(SectionsForChildOfSelectorAtoms.sections, [])
  }
}
