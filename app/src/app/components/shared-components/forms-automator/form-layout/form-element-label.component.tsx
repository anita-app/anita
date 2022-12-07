import React from 'react'
import { useTippyTooltip } from 'app/components/hooks/use-tippy-tooltip'
import { Icons } from 'app/libs/icons/icons.class'

interface IFormElementLabelProps {
  label: string
  labelHint?: string
}

export const FormElementLabel = ({ label, labelHint }: IFormElementLabelProps) => {
  const elementId = encodeURIComponent(label)
  useTippyTooltip(elementId, labelHint)

  return (
    <div className="w-full block">
      <label className="mb-0 ml-1 text-gray-700 text-sm">{label}</label>
      {labelHint && (
        <i id={elementId} className="text-gray-500 text-sm ml-1">{Icons.render('informationCircleOutline')}</i>
      )}
    </div>
  )
}
