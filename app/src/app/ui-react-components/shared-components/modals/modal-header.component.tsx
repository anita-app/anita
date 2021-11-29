import { ReactNode } from 'react';

export const ModalHeader = ({ children }: { children: ReactNode }) => (
  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
    {children}
  </h3>
);
