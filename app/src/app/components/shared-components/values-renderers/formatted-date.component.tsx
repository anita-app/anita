import * as dateFormat from 'date-format'
import type { FC } from 'react'

interface IFormattedDateProps {
  value: string
}

export const FormattedDate: FC<IFormattedDateProps> = (props) => props.value ? <>{dateFormat('yyyy/MM/dd', new Date(props.value))}</> : null
