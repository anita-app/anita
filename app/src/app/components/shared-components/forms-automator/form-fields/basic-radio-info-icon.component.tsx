import { memo } from 'react'
import { Icons } from 'app/libs/icons/icons.class'
import { useTippyTooltip } from 'app/components/hooks/tippy-tooltip'
import type { FC } from 'react'

interface IBasicRadioInfoIconProps {
  fieldId: string
  indexOption: number
  optionHint: string
}

export const BasicRadioInfoIcon: FC<IBasicRadioInfoIconProps> = memo(function BasicRadio (props: IBasicRadioInfoIconProps) {
  useTippyTooltip(`${props.fieldId}${props.indexOption}`, props.optionHint)

  // We use relaxed equal (==) here because the value of the radio button might be a string or a number.
  return (
    <span id={`${props.fieldId}${props.indexOption}`}>
      <sup>
        {Icons.render('informationCircleOutline', 'ml-1 text-xs')}
      </sup>
    </span>
  )
})
