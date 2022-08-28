import React from 'react'

interface IMonthProps {
  value: string
}

export const Month: React.FC<IMonthProps> = ({ value }) => value
  ? <>{new Date(value).toLocaleString('default', { month: 'short', year: 'numeric' })}</>
  : null
