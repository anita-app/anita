import React, { ReactNode } from 'react'

interface IModalContentProps {
  children: ReactNode
  icon?: string
}

export const ModalContent: React.FC<IModalContentProps> = ({ children, icon }) => (
  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
    <div className="sm:flex sm:items-start">
      {icon && (
        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <i className={`${icon} text-xl -mt-1`}></i>
        </div>
      )}
      <div className="sm:flex sm:items-start">
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          {children}
        </div>
      </div>
    </div>
  </div>
)
