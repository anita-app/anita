import React, { ReactNode } from 'react'

interface IModalFooterProps {
  children: ReactNode
}

export const ModalFooter: React.FC<IModalFooterProps> = ({ children }) => (
  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
    {children}
  </div>
)
