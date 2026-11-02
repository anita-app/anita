import type { FC } from 'react'

interface IEmailProps {
  value: string
}

/** @featurePart field.short-text */
export const Email: FC<IEmailProps> = (props) => props.value
  ? (
    <a
      href={`mailto:${props.value}`}
      target="_blank"
      rel="noreferrer"
      className="underline"
    >
      {props.value}
    </a>
    )
  : null
