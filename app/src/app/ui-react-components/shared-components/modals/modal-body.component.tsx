import { ReactNode } from 'react';

export const ModalBody = ({ children }: { children: ReactNode }) => (
  <div className="mt-2">
    {children}
  </div>
);