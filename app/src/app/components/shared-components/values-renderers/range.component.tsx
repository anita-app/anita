import type { FC } from 'react'

interface IPercentageProps {
  value: string
}

/** @featurePart field.short-text */
export const Percentage: FC<IPercentageProps> = (props) => props.value ? <>{props.value}%</> : null
