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
