import { estimateMenuHeight, menuLayoutFor } from 'app/components/shared-components/common-ui-eles/select.component'

const WINDOW = 800

describe('menuLayoutFor', () => {
  it('opens below the field when the options fit there', () => {
    expect(menuLayoutFor({ top: 100, bottom: 142 }, WINDOW, 200)).toEqual({ placement: 'bottom', maxHeight: 300 })
  })

  it('opens above the field when they fit only there', () => {
    const layout = menuLayoutFor({ top: 600, bottom: 642 }, WINDOW, 250)
    expect(layout.placement).toBe('top')
    expect(layout.maxHeight).toBe(300)
  })

  it('opens on the side with more space, and is never taller than that space', () => {
    expect(menuLayoutFor({ top: 300, bottom: 342 }, 500, 1000)).toEqual({ placement: 'top', maxHeight: 282 })
    expect(menuLayoutFor({ top: 150, bottom: 192 }, 500, 1000)).toEqual({ placement: 'bottom', maxHeight: 290 })
  })

  it('keeps short menus below even when there is more space above', () => {
    expect(menuLayoutFor({ top: 600, bottom: 642 }, WINDOW, 100).placement).toBe('bottom')
  })
})

describe('estimateMenuHeight', () => {
  it('counts options and group headings', () => {
    expect(estimateMenuHeight([{ value: 'a' }, { value: 'b' }])).toBe(8 + 2 * 38)
    expect(estimateMenuHeight([{ label: 'G', options: [{ value: 'a' }] }])).toBe(8 + 32 + 38)
  })
})
