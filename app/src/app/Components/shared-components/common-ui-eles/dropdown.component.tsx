import React, { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import ReactTooltip from 'react-tooltip'
import { Icons, TIconName } from 'app/libs/icons/icons.class'

function classNames (...classes: Array<string>) {
  return classes.filter(Boolean).join(' ')
}

export interface IMenuItem {
  id: string
  label: string
  handleClick: () => void
}

interface IDropdown {
  id: string
  label: string
  menuItems: Array<IMenuItem>
  labelClassName?: string
  chevronClassName?: string
  icon?: TIconName
  iconClassName?: string
  tooltip?: string
  tooltipClassName?: string
  margin?: string
}

export const Dropdown: React.FC<IDropdown> = (props) => (
  <Menu as="div" className={`relative inline-block text-left ${props.margin || ''}`}>
    <div>
      <Menu.Button
        className="leading-none px-4 py-3 text-gray-800 inline-flex justify-center w-full bg-gray-100 text-sm hover:bg-gray-200 rounded"
        data-tip={!!props.tooltip}
        data-for={props.id}
      >
        {props.icon && Icons.render(props.icon, props.iconClassName ?? 'mr-2')}
        {!!props.label && <span className={props.labelClassName ?? ''}>{props.label}</span>}
        {Icons.render('chevronDownOutline', `-mr-1 ml-2 w-5 ${props.chevronClassName ?? ''}`)}
      </Menu.Button>
      {!!props.tooltip && (
        <span className={props.tooltipClassName}>
          <ReactTooltip id={props.id} effect="solid">
            {props.tooltip}
          </ReactTooltip>
        </span>
      )}
    </div>

    <Transition
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div className="py-1">
        {props.menuItems.map((item) => (
          <Menu.Item key={item.id}>
            {({ active }) => (
              <div
                className={classNames(
                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                  'block px-4 py-2 text-sm cursor-pointer'
                )}
                onClick={item.handleClick}
              >
                {item.label}
              </div>
            )}
          </Menu.Item>
        ))}
        </div>
      </Menu.Items>
    </Transition>
  </Menu>
)
