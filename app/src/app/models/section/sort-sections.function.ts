import type { ISection } from 'app/models/section/section.declarations'

/**
 * Sections in their saved order. Sections saved before positions existed keep their relative order at the end.
 */
export const sortSections = <S extends ISection>(sections: Array<S>): Array<S> => (
  sections
    .map((section, index) => ({ section, index }))
    .sort((a, b) => ((a.section.position ?? Number.MAX_SAFE_INTEGER) - (b.section.position ?? Number.MAX_SAFE_INTEGER)) || a.index - b.index)
    .map(item => item.section)
)

/**
 * Sets the position of each section from its index.
 */
export const withPositions = <S extends ISection>(sections: Array<S>): Array<S> => sections.map((section, position) => ({ ...section, position }))
