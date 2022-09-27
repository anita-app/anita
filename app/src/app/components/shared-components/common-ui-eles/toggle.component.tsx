import React, { useState } from 'react'
import { Switch } from '@headlessui/react'

function classNames (...classes: Array<string>) {
  return classes.filter(Boolean).join(' ')
}

interface IToggleProps {
  label: string
  initialState: boolean
  marginVerticalClassName?: string
  labelPosition?: 'left' | 'right'
  onChange: (value: boolean) => void
}

export const Toggle: React.FC<IToggleProps> = (props) => {
  const [enabled, setEnabled] = useState(props.initialState)

  const handleToggleChange = (value: boolean) => {
    setEnabled(value)
    props.onChange(value)
  }

  return (
    <Switch.Group as="div" className={`flex items-center ${props.marginVerticalClassName ?? 'my-4'}`}>
      {props.labelPosition === 'left' && (
        <Switch.Label as="span" className="mr-3">
          <span className="text-sm font-medium text-gray-900">{props.label}</span>
        </Switch.Label>
      )}
      <Switch
        checked={enabled}
        onChange={handleToggleChange}
        className={classNames(
          enabled ? 'bg-prussian-blue-600' : 'bg-gray-200',
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-prussian-blue-500 focus:ring-offset-2'
        )}
      >
        <span
          aria-hidden="true"
          className={classNames(
            enabled ? 'translate-x-5' : 'translate-x-0',
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
          )}
        />
      </Switch>
      {props.labelPosition !== 'left' && (
        <Switch.Label as="span" className="ml-3">
          <span className="text-sm font-medium text-gray-900">{props.label}</span>
        </Switch.Label>
      )}
    </Switch.Group>
  )
}
