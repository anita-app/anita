import { useId } from 'react'
import { Icons } from 'app/libs/icons/icons.class'
import type { FC, ReactNode } from 'react'
import type { IListTabsHeaderRightProps } from 'app/components/project/section/list/tabs/header-right.component'

interface ICollapsibleProps {
  collapsed: boolean
  onToggle: () => void
  /** Shown next to the header when the content is collapsed */
  summary?: ReactNode
}

interface IMainContentContainerProps {
  headerText?: string
  headerRightComponent?: FC<IListTabsHeaderRightProps>
  headerRightComponentProps?: IListTabsHeaderRightProps
  hasHeaderOnlyStyle?: boolean
  overflowClassName?: string
  /** The header becomes a button that shows and hides the content */
  collapsible?: ICollapsibleProps
  children: ReactNode
}

export const MainContentContainer: FC<IMainContentContainerProps> = (props) => {
  const RightComponent = props.headerRightComponent
  const contentId = useId()
  const collapsed = !!props.collapsible?.collapsed
  return (
    <div className={props.hasHeaderOnlyStyle ? '' : 'p-4 bg-white rounded shadow'}>
      {props.headerText && (
      <div className={props.hasHeaderOnlyStyle ? 'p-4' : ''}>
        {props.collapsible
          ? (
            // The whole header, padding included, toggles the content.
            <h3 className={`-mx-4 -mt-4 ${collapsed ? '-mb-4' : ''}`}>
              <button
                type="button"
                onClick={props.collapsible.onToggle}
                aria-expanded={!collapsed}
                aria-controls={contentId}
                className={`w-full flex items-center justify-between gap-3 px-4 pt-7 ${collapsed ? 'pb-7' : ''} text-left cursor-pointer group`}
              >
                <span className="flex items-baseline gap-2 min-w-0">
                  <span className="text-xl font-semibold truncate">{props.headerText}</span>
                  {collapsed && props.collapsible.summary && <span className="text-gray-500 truncate">{props.collapsible.summary}</span>}
                </span>
                <span className={`shrink-0 text-xl text-gray-400 group-hover:text-gray-700 transition-transform ${collapsed ? '' : 'rotate-180'}`}>{Icons.render('chevronDownOutline')}</span>
              </button>
            </h3>)
          : (
            <div className="mt-3 flex justify-between">
              <h3 className="text-xl font-semibold truncate">{props.headerText}</h3>
              {!!RightComponent && !!props.headerRightComponentProps && <RightComponent {...props.headerRightComponentProps} />}
            </div>)}
        {!props.hasHeaderOnlyStyle && !collapsed && <hr className="mt-4" />}
      </div>
      )}
      <div
        id={contentId}
        hidden={collapsed}
        className={`pt-4 pb-4 ${props.overflowClassName ?? 'overflow-y-auto'}`}
      >
        {props.children}
      </div>
    </div>
  )
}
