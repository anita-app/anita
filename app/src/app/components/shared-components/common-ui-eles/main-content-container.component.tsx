import React, { ReactNode } from 'react'

interface IMainContentContainerProps {
  headerText?: string
  headerRightComponent?: ReactNode
  hasHeaderOnlyStyle?: boolean
  overflowClassName?: string
  children: ReactNode
}

export const MainContentContainer: React.FC<IMainContentContainerProps> = (props) => (
  <div className={props.hasHeaderOnlyStyle ? '' : 'p-4 bg-white rounded shadow'}>
    {props.headerText && (
      <div className={props.hasHeaderOnlyStyle ? 'p-4' : ''}>
        <div className="mt-3 flex justify-between">
          <h3 className="text-xl font-bold">{props.headerText}</h3>
          {props.headerRightComponent && props.headerRightComponent}
        </div>
        {!props.hasHeaderOnlyStyle && <hr className="mt-4" />}
      </div>
    )}
    <div className={`pt-4 pb-4 ${props.overflowClassName ?? 'overflow-y-auto'}`}>
      {props.children}
    </div>
  </div>
)
