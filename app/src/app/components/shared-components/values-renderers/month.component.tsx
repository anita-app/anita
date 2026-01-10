import type { FC } from 'react'

interface IMonthProps {
  value: string
}

export const Month: FC<IMonthProps> = (props) => props.value
  ? <>{new Date(props.value).toLocaleString('default', { month: 'short', year: 'numeric' })}</>
  : null
