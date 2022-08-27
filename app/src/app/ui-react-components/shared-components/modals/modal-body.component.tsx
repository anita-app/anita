import { ReactNode } from 'react';

interface IModalBodyProps {
  children: ReactNode
}

export const ModalBody: React.FC<IModalBodyProps> = ({ children }) => (
  <div className="mt-2">
    {children}
  </div>
);