import ReactSelect from 'react-select'
import { useRef, useState } from 'react'
import type { GroupBase, OptionsOrGroups, Props } from 'react-select'

/** Space kept free between the menu and the edge of the window. */
const EDGE_GAP = 8
/** Margin react-select puts between the field and its menu, plus the border of the menu. */
const MENU_GAP = 10
const DEFAULT_MAX_HEIGHT = 300
// Used to guess the height of the options before the menu is shown.
const OPTION_HEIGHT = 38
const GROUP_HEADING_HEIGHT = 32
const LIST_PADDING = 8

interface IMenuLayout {
  placement: 'top' | 'bottom'
  maxHeight: number
}

/**
 * Where the menu of a select opens: below the field when the options fit there, otherwise on the side with more
 * space. The menu is never taller than the space on that side, and its options scroll inside it.
 * @internal
 */
export const menuLayoutFor = (field: { top: number; bottom: number }, windowHeight: number, contentHeight: number, preferredMaxHeight = DEFAULT_MAX_HEIGHT): IMenuLayout => {
  const spaceBelow = windowHeight - field.bottom - MENU_GAP - EDGE_GAP
  const spaceAbove = field.top - MENU_GAP - EDGE_GAP
  const wantedHeight = Math.min(contentHeight, preferredMaxHeight)
  const placement = spaceBelow >= wantedHeight || spaceBelow >= spaceAbove ? 'bottom' : 'top'
  const space = placement === 'bottom' ? spaceBelow : spaceAbove
  return { placement, maxHeight: Math.max(0, Math.min(preferredMaxHeight, space)) }
}

/**
 * Guess of the height of all the options, groups included.
 * @internal
 */
export const estimateMenuHeight = <Option, Group extends GroupBase<Option>>(options: OptionsOrGroups<Option, Group> = []): number => (
  options.reduce((height, item) => {
    const groupOptions = (item as Partial<Group>).options
    return height + (Array.isArray(groupOptions) ? GROUP_HEADING_HEIGHT + groupOptions.length * OPTION_HEIGHT : OPTION_HEIGHT)
  }, LIST_PADDING) || OPTION_HEIGHT
)

/**
 * react-select whose menu never goes out of the window, nor makes the page or a dialog scroll: it opens up or down
 * where there is space, and its options scroll inside it when they do not fit.
 *
 * The menu is rendered with a fixed position in the open dialog (outside the dialog the rest of the page cannot be
 * clicked) or in the page, so that no container cuts it.
 * @internal
 */
export const Select = <Option, IsMulti extends boolean = false, Group extends GroupBase<Option> = GroupBase<Option>>(props: Props<Option, IsMulti, Group>) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<IMenuLayout>({ placement: 'bottom', maxHeight: props.maxMenuHeight ?? DEFAULT_MAX_HEIGHT })
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)

  // Measured when the menu opens, so it renders where it fits the first time.
  const handleMenuOpen = () => {
    const wrapper = wrapperRef.current
    if (wrapper) {
      setLayout(menuLayoutFor(wrapper.getBoundingClientRect(), window.innerHeight, estimateMenuHeight(props.options), props.maxMenuHeight ?? DEFAULT_MAX_HEIGHT))
      setPortalTarget(wrapper.closest<HTMLElement>('[role="dialog"]') ?? document.body)
    }
    props.onMenuOpen?.()
  }

  // A fixed menu would leave the field behind when the page or the dialog scrolls: it closes instead. Scrolling the
  // options does not close it.
  const closeMenuOnScroll = (event: Event): boolean => (
    event.target instanceof Node && !!wrapperRef.current && event.target.contains(wrapperRef.current)
  )

  const styles = props.styles

  return (
    <div ref={wrapperRef}>
      <ReactSelect<Option, IsMulti, Group>
        {...props}
        menuPlacement={layout.placement}
        maxMenuHeight={layout.maxHeight}
        minMenuHeight={Math.min(layout.maxHeight, 140)}
        menuPosition="fixed"
        menuPortalTarget={portalTarget}
        menuShouldScrollIntoView={false}
        closeMenuOnScroll={closeMenuOnScroll}
        onMenuOpen={handleMenuOpen}
        styles={{
          ...styles,
          menuPortal: (base, state) => ({ ...(styles?.menuPortal ? styles.menuPortal(base, state) : base), zIndex: 50 }),
        }}
      />
    </div>
  )
}
