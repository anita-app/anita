import React, { ReactNode } from 'react'

interface ICardFooterItemsEndProps {
  children: ReactNode
}

export const CardFooterItemsEnd: React.FC<ICardFooterItemsEndProps> = ({ children }) => (
  <div className="flex items-end flex-wrap mt-6">
    {children}
  </div>
)
