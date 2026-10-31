import type { ISectionElement } from 'app/models/section-element/section-element.declarations'

/**
 * Defines the properties of each parent to which a element is connected.
 * @featurePart relation.link-to-parent
 */
export interface ParentInfoForDetailsView {
  txt: string
  sectionId: string
  element: ISectionElement
}
