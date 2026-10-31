import { atom } from 'jotai'
import type { ISectionElement } from 'app/models/section-element/section-element.declarations'

/** @featurePart record.add, record.edit */
export class FormElementAtoms {
  public static element = atom<ISectionElement | null>(null)
}
