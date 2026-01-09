import { atom } from 'jotai'
import { SectionDetailsDeclaration } from 'app/models/section/section.declarations'

export class SectionsForChildOfSelectorAtoms {
  public static sections = atom<Array<SectionDetailsDeclaration>>([])
}
