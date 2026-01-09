import { atom } from 'jotai'

export interface IFormElesValidState {
  [formEleUniqueId: string]: boolean
}

export class FormElesValidStateAtoms {
  public static validState = atom<IFormElesValidState>({})
}
