import type { FC } from 'react'

interface IColorProps {
  value: string
}
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
