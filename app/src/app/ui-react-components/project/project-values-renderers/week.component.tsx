import React from 'react'

interface IWeekProps {
  value: string
}

export const Week: React.FC<IWeekProps> = ({ value }) => value
  ? <>{value.split('-W').reverse().join('-').replace(/0(\d+)/, '$1')}</>
  : null
