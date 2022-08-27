import { ReactNode } from 'react';

interface IModalHeaderProps {
  children: ReactNode
}

export const ModalHeader: React.FC<IModalHeaderProps> = ({ children }) => (
  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
    {children}
  </h3>
);
