import { ReactNode } from 'react';
export const MainContentContainer = ({ children, headerText }: { children: ReactNode, headerText?: string }) => (
  <div className="p-4 bg-white rounded shadow">
    {headerText ? <div className="mt-3">
      <h3 className="text-xl font-bold">{headerText}</h3>
      <hr className="mt-4" />
    </div> : null}
    <div className="pt-4">
      {children}
    </div>
  </div>
)