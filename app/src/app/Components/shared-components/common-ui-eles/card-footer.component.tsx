import React, { ReactNode } from 'react'

interface ICardFooter {
  children: ReactNode
  className?: string
}

export const CardFooter: React.FC<ICardFooter> = (props) => (
  <div className={`flex justify-between items-end flex-wrap mt-6 ${props.className ?? ''}`}>
    {props.children}
  </div>
)
