import { atom } from 'jotai'

/** @internal */
export interface IFormElesValidState {
  [formEleUniqueId: string]: boolean
}

/** @featurePart field.required, field.format-validation */
export class FormElesValidStateAtoms {
  public static validState = atom<IFormElesValidState>({})
}
