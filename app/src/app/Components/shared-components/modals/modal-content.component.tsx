import { Icons, TIconName } from 'app/libs/Icons/Icons.class'
import React, { ReactNode } from 'react'

interface IModalContentProps {
  children: ReactNode
  icon?: TIconName
  iconClassName?: string
}

export const ModalContent: React.FC<IModalContentProps> = (props) => (
  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
    <div className="sm:flex sm:items-start">
      {props.icon && (
        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          {Icons.render(props.icon, `${props.iconClassName} text-xl -mt-1`)}
        </div>
      )}
      <div className="sm:flex sm:items-start">
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          {props.children}
        </div>
      </div>
    </div>
  </div>
)
