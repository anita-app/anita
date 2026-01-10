import { atom } from 'jotai'
import type { SectionDetailsDeclaration } from 'app/models/section/section.declarations'

export class SectionsForChildOfSelectorAtoms {
  public static sections = atom<Array<SectionDetailsDeclaration>>([])
}
