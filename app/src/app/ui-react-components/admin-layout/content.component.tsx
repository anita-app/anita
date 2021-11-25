import { ReactNode } from 'react';

export const Content = (props: { children: ReactNode }) => (
  <div className="flex-1 p-2 md:p-3 md:pt-5 lg:pt-5 lg:p-10 pt-5 overflow-auto">
    {props.children}
  </div>
);