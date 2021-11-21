import { ReactNode } from 'react';

export const CardFooterItemsEnd = ({ children }: { children: ReactNode }) => (
  <div className="flex items-end flex-wrap mt-6">
    {children}
  </div>
)