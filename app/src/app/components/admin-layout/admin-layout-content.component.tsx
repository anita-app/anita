import type { FC, ReactNode } from 'react'

interface IContentProps {
  children: ReactNode
}

export const AdminLayoutContent: FC<IContentProps> = (props) => (
  <div className="flex-1 p-2 md:p-3 md:pt-5 lg:pt-5 lg:p-10 pt-5 pb-24 md:pb-24 lg:pb-24 overflow-auto main-scrollbar">
    {props.children}
  </div>
)
