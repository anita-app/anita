import { ReactNode } from 'react'

interface IMainContentContainerProps {
  headerText?: string
  children: ReactNode
}

export const MainContentContainer: React.FC<IMainContentContainerProps> = ({ children, headerText }) => (
  <div className="p-4 bg-white rounded shadow">
    {headerText && (
      <>
        <div className="mt-3">
          <h3 className="text-xl font-bold">{headerText}</h3>
        </div>
        <hr className="mt-4" />
      </>
    )}
    <div className="pt-4 pb-4 overflow-y-auto">
      {children}
    </div>
  </div>
)