import type { FC, ReactNode } from 'react'

interface IModalHeaderProps {
  children: ReactNode
}

export const ModalHeader: FC<IModalHeaderProps> = (props) => (
  <h3
    className="text-lg leading-6 font-medium text-gray-900"
    id="modal-title"
  >
    {props.children}
  </h3>
)
