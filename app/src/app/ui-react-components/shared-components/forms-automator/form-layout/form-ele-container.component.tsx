import { ReactNode } from 'react';

export const FormEleContainer = ({ children, width }: { children: ReactNode, width: string | number }) => (
  <div className={`${width} my-3 px-2 inline-block align-top`}>
    {children}
  </div>
)