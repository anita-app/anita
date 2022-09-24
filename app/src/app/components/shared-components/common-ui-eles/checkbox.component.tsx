import React, { useState } from 'react'

interface ICheckboxProps {
  label?: string
  initialValue: boolean
  onChange: (value: boolean) => void
}

export const Checkbox: React.FC<ICheckboxProps> = (props) => {
  const [checked, setChecked] = useState(props.initialValue)

  const handleOnChange = () => {
    setChecked(!checked)
    props.onChange(!checked)
  }

  return (
    <fieldset className="space-y-5">
      <div className="relative flex items-start">
        <div className="flex h-5 items-center">
          <input
            id="offers"
            aria-describedby="offers-description"
            name="offers"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-prussian-blue-600 focus:ring-prussian-blue-500"
            onChange={handleOnChange}
            checked={checked}
          />
        </div>
        {!!props.label && (
          <div className="ml-3 text-sm">
            <label htmlFor="offers" className="font-medium text-gray-700">
              {props.label}
            </label>
          </div>
        )}
      </div>
    </fieldset>
  )
}
