import { useTippyTooltip } from 'app/components/hooks/tippy-tooltip'
import { Icons } from 'app/libs/icons/icons.class'
import { useId, type FC } from 'react'

interface IFormElementLabelProps {
  label: string
  labelHint?: string
}

export const FormElementLabel: FC<IFormElementLabelProps> = (props) => {
  // Used as a CSS selector by the tooltip: only letters, digits and dashes.
  const elementId = `label-hint-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`
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
