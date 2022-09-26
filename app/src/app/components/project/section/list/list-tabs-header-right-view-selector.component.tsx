import { Tab } from '@headlessui/react'
import { Icons } from 'app/libs/icons/icons.class'
import { SupportedViews, SUPPORTED_VIEWS_ICONS } from 'app/models/section/view-settings.const'
import React from 'react'

function classNames (...classes: Array<string>) {
  return classes.filter(Boolean).join(' ')
}

interface IListTabsHeaderRightViewSelectorProps {
  activeTab: SupportedViews
}

export const ListTabsHeaderRightViewSelector: React.FC<IListTabsHeaderRightViewSelectorProps> = (props) => (
  <Tab.List className={`flex space-x-1 rounded-md ${props.activeTab === SupportedViews.grid ? 'bg-gray-200' : 'bg-gray-100'} p-1 w-20`}>
    {SUPPORTED_VIEWS_ICONS.map(view => (
      <Tab
        key={view}
        className={({ selected }) => classNames(
          'flex items-center justify-center w-full rounded text-sm font-medium leading-5 text-prussian-blue-700',
          selected
            ? 'bg-white shadow'
            : 'hover:bg-white/[0.12] hover:text-prussian-blue-500'
        )}
      >
        {Icons.render(view)}
      </Tab>
    ))}
  </Tab.List>
)
