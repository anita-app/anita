import type { FC } from 'react'

interface IPercentageProps {
  value: string
}

export const Percentage: FC<IPercentageProps> = (props) => props.value ? <>{props.value}%</> : null
