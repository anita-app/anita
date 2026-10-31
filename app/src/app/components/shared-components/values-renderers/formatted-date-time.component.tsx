import dateFormat from 'date-format'
import type { FC } from 'react'

interface IFormattedDateTimeProps {
  value: string
}

/** @featurePart field.date-time */
export const FormattedDateTime: FC<IFormattedDateTimeProps> = (props) => props.value ? <>{dateFormat('yyyy/MM/dd hh:mm', new Date(props.value))}</> : null
