import type { FC } from 'react'

interface IColorProps {
  value: string
}
/** @featurePart field.short-text */
export const Color: FC<IColorProps> = (props) => props.value
  ? (
    <div
      className="rounded-full"
      style={{ backgroundColor: props.value, width: '25px' }}
    >
      &nbsp;
    </div>
    )
  : null
