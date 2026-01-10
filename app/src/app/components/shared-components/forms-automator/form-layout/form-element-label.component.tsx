import { useTippyTooltip } from 'app/components/hooks/tippy-tooltip'
import { Icons } from 'app/libs/icons/icons.class'
import type { FC } from 'react'

interface IFormElementLabelProps {
  label: string
  labelHint?: string
}

export const FormElementLabel: FC<IFormElementLabelProps> = (props) => {
  const elementId = encodeURIComponent(props.label)
  useTippyTooltip(elementId, props.labelHint)

  return (
    <div className="w-full block">
      <label className="mb-0 ml-1 text-gray-700 text-sm">{props.label}</label>
      {props.labelHint && (
        <i
          id={elementId}
          className="text-gray-500 text-sm ml-1"
        >{Icons.render('informationCircleOutline')}
        </i>
      )}
    </div>
  )
}
