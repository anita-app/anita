import type { FC } from 'react'

interface ITelProps {
  value: string
}

export const Tel: FC<ITelProps> = (props) => props.value
  ? (
    <a
      href={`tel:${props.value}`}
      target="_blank"
      rel="noreferrer"
      className="underline"
    >
      {props.value}
    </a>
    )
  : null
