import { Bucket } from 'app/state/bucket.state'
import { FormElementAtoms } from 'app/state/form-element/form-element.atoms'
import { ISectionElement } from 'app/models/section-element/section-element.declarations'

export class FormElementState {
  public static setElement = (element: ISectionElement | null) => {
    Bucket.general.set(FormElementAtoms.element, element ? { ...element } : null)
  }

  public static updateElementKey = (fieldName: keyof ISectionElement, value: ISectionElement[keyof ISectionElement]) => {
    const current = Bucket.general.get(FormElementAtoms.element)
    const next = { ...(current ?? {}), [fieldName]: value } as ISectionElement
    Bucket.general.set(FormElementAtoms.element, next)
  }

  public static getElement = (): ISectionElement | null => (
    Bucket.general.get(FormElementAtoms.element)
  )
}
