import { IListTabsHeaderRightProps } from 'app/components/project/section/list/list-tabs-header-right.component'
import React, { ReactNode } from 'react'

interface IMainContentContainerProps {
  headerText?: string
  headerRightComponent?: React.FC<IListTabsHeaderRightProps>
  headerRightComponentProps?: IListTabsHeaderRightProps
  hasHeaderOnlyStyle?: boolean
  overflowClassName?: string
  children: ReactNode
}

export const MainContentContainer: React.FC<IMainContentContainerProps> = (props) => {
  const RightComponent = props.headerRightComponent
  return (
    <div className={props.hasHeaderOnlyStyle ? '' : 'p-4 bg-white rounded shadow'}>
      {props.headerText && (
      <div className={props.hasHeaderOnlyStyle ? 'p-4' : ''}>
        <div className="mt-3 flex justify-between">
          <h3 className="text-xl font-bold truncate">{props.headerText}</h3>
          {!!RightComponent && !!props.headerRightComponentProps && <RightComponent {...props.headerRightComponentProps} />}
        </div>
        {!props.hasHeaderOnlyStyle && <hr className="mt-4" />}
      </div>
      )}
      <div className={`pt-4 pb-4 ${props.overflowClassName ?? 'overflow-y-auto'}`}>
        {props.children}
      </div>
    </div>
  )
}
