import { ReactNode } from 'react';

export const Content = (props: { children: ReactNode }) => (
  <div className="flex-1 p-10 pt-5 overflow-auto">
    {props.children}
  </div>
);