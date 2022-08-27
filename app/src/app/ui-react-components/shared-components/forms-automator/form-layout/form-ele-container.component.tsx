import { ReactNode } from 'react';

interface IFormEleContainerProps {
  children: ReactNode
  width: string | number
}

export const FormEleContainer: React.FC<IFormEleContainerProps> = ({ children, width }) => (
  <div className={`${width} my-3 px-2 inline-block align-top`}>
    {children}
  </div>
)