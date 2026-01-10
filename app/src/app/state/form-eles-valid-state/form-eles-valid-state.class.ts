import { Bucket } from 'app/state/bucket.state'
import { FormElesValidStateAtoms } from 'app/state/form-eles-valid-state/form-eles-valid-state.atoms'
import type { IFormElesValidState } from 'app/state/form-eles-valid-state/form-eles-valid-state.atoms'

export class FormElesValidState {
  public static setValidStateForEle = (formEleId: string, valid: boolean) => {
    const current = Bucket.general.get(FormElesValidStateAtoms.validState)
    Bucket.general.set(FormElesValidStateAtoms.validState, { ...current, [formEleId]: valid })
  }

  public static unsetValidStateForEle = (formEleId: string) => {
    const current = Bucket.general.get(FormElesValidStateAtoms.validState)
    const next = { ...current }
    delete next[formEleId]
    Bucket.general.set(FormElesValidStateAtoms.validState, next)
  }

  public static getValidState = (): IFormElesValidState => (
    Bucket.general.get(FormElesValidStateAtoms.validState)
  )
}
