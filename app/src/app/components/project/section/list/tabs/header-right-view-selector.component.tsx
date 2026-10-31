import { Tab } from '@headlessui/react'
import { Icons } from 'app/libs/icons/icons.class'
import { SUPPORTED_VIEWS_ICONS } from 'app/models/section/view-settings.const'
import type { SupportedViews } from 'app/models/section/view-settings.const'
import type { FC } from 'react'

interface IListTabsHeaderRightViewSelectorProps {
  activeTab: SupportedViews
}

/** Each button is 32px wide (ui-seg-btn): the white thumb slides under the selected one. */
const BUTTON_WIDTH_PX = 32

/**
 * @feature view.switch-view
 * @title Switch between table and cards
 * @summary Chooses whether the records of a section are shown as a table or as cards.
 * @where List of a section: the two icons at the top right of the list (table, grid).
 * @usage Click the table icon to see the records as a table, or the grid icon to see them as cards.
 * @options Table (default) or grid of cards.
 * @rules The choice is remembered for each section and saved in the project, so it is the same on the other devices and for the other users the project is synced with. A white marker slides under the selected icon.
 * @errors none
 * @status stable
 * @since 0.14.0
 * @routes projectSectionElesList
 * @covers view:table, view:grid
 * @related view.table, view.grid
 */
export const ListTabsHeaderRightViewSelector: FC<IListTabsHeaderRightViewSelectorProps> = (props) => (
  <Tab.List className="ui-seg">
    <span
      className="ui-seg-thumb"
      style={{ transform: `translateX(${props.activeTab * BUTTON_WIDTH_PX}px)` }}
      aria-hidden="true"
    />
    {SUPPORTED_VIEWS_ICONS.map(view => (
      <Tab
        key={view}
        className="ui-seg-btn text-base"
      >
        {Icons.render(view)}
      </Tab>
    ))}
  </Tab.List>
)
