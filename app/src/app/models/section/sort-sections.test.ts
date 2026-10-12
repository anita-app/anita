import { sortSections, withPositions } from 'app/models/section/sort-sections.function'
import type { ISection } from 'app/models/section/section.declarations'

const section = (id: string, position?: number): ISection => ({ id, title: id, createdAt: '', formModel: [], ...(position === undefined ? {} : { position }) })

describe('sortSections', () => {
  it('orders sections by position', () => {
    expect(sortSections([section('b', 1), section('c', 2), section('a', 0)]).map(s => s.id)).toEqual(['a', 'b', 'c'])
  })

  it('keeps sections without position at the end, in their order', () => {
    expect(sortSections([section('x'), section('b', 1), section('y'), section('a', 0)]).map(s => s.id)).toEqual(['a', 'b', 'x', 'y'])
  })

  it('assigns positions from the order', () => {
    expect(withPositions([section('z'), section('a')]).map(s => s.position)).toEqual([0, 1])
  })
})
