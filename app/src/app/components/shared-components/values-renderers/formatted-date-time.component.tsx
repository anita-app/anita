import * as dateFormat from 'date-format'
import type { FC } from 'react'

interface IFormattedDateTimeProps {
  value: string
}

export const FormattedDateTime: FC<IFormattedDateTimeProps> = (props) => props.value ? <>{dateFormat('yyyy/MM/dd hh:mm', new Date(props.value))}</> : null
