import React, { Fragment, useRef } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { TIconName } from 'app/libs/icons-n/icons.class'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { useClickOutside } from 'app/components/hooks/click-outside.hook'

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

export const Dropdown: React.FC<IDropdown> = (props) => {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = React.useState(false)
  const toggleOpen = (currentState: boolean) => setOpen(!currentState)
  const closeDropdown = () => setOpen(false)
  useClickOutside(dropdownRef, closeDropdown)
  return (
    <Menu as="div" className={`relative inline-block text-left ${props.margin || ''}`}>
      <div ref={dropdownRef}>
        <div>
          <Button
            id={props.id}
            label={props.label}
            labelClassName={props.labelClassName}
            type={Type.secondary}
            iconLeft={props.icon}
            iconLeftClassName={props.iconClassName}
            iconRight="chevronDownOutline"
            iconRightClassName={props.chevronClassName}
            tooltip={props.tooltip}
            tooltipContainerClassName={props.tooltipClassName}
            onClick={() => toggleOpen(open)}
            marginClassName=""
          />
        </div>

        <Transition
          show={open}
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items
            as="div"
            className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
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
      </div>
    </Menu>
  )
}
