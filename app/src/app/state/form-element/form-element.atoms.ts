import { atom } from 'jotai'
import { ISectionElement } from 'app/models/section-element/section-element.declarations'

export class FormElementAtoms {
  public static element = atom<ISectionElement | null>(null)
}
