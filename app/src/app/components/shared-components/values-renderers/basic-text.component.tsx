import type { FC } from 'react'

interface IBasicTextProps {
  value: string
}

export const BasicText: FC<IBasicTextProps> = (props) => props.value ? <>{props.value}</> : null
