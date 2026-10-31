import type { FC } from 'react'

interface IWeekProps {
  value: string
}

/** @featurePart field.date */
export const Week: FC<IWeekProps> = (props) => props.value
  ? <>{props.value.split('-W').reverse().join('-').replace(/0(\d+)/, '$1')}</>
  : null
