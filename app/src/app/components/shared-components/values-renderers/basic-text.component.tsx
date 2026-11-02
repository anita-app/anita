import type { FC } from 'react'

interface IBasicTextProps {
  value: string
}

/** @featurePart field.short-text, field.date-time */
export const BasicText: FC<IBasicTextProps> = (props) => props.value ? <>{props.value}</> : null
