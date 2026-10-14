import { useId } from 'react'
import { Icons } from 'app/libs/icons/icons.class'
import type { FC, ReactNode } from 'react'
import type { IListTabsHeaderRightProps } from 'app/components/project/section/list/tabs/header-right.component'

interface ICollapsibleProps {
  collapsed: boolean
  onToggle: () => void
}

interface IMainContentContainerProps {
  headerText?: string
  /** Small line above the header, e.g. the name of the project */
  eyebrow?: string
  /** Number shown next to the header, e.g. how many records a list has */
  count?: number
  headerRightComponent?: FC<IListTabsHeaderRightProps>
  headerRightComponentProps?: IListTabsHeaderRightProps
  hasHeaderOnlyStyle?: boolean
  overflowClassName?: string
  /** Long headers wrap instead of being cut, e.g. when the header is the title of a record */
  wrapHeader?: boolean
  /** The header becomes a button that shows and hides the content */
  collapsible?: ICollapsibleProps
  children: ReactNode
}

export const MainContentContainer: FC<IMainContentContainerProps> = (props) => {
  const RightComponent = props.headerRightComponent
  const contentId = useId()
  const collapsed = !!props.collapsible?.collapsed
  const headerTextClassName = `ui-title text-xl ${props.wrapHeader ? 'break-words min-w-0' : 'truncate'}`
  const titleBlock = (
    <span className="block min-w-0">
      {props.eyebrow && <span className="ui-eyebrow block truncate">{props.eyebrow}</span>}
      <span className="flex items-center gap-2 min-w-0">
        <span className={headerTextClassName}>{props.headerText}</span>
        {props.count !== undefined && <span className="ui-count shrink-0">{props.count}</span>}
      </span>
    </span>
  )
  return (
    <div className={props.hasHeaderOnlyStyle ? '' : 'ui-card ui-rise p-4 md:px-5'}>
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
                {titleBlock}
                <span className={`shrink-0 text-xl text-gray-400 group-hover:text-gray-700 transition-transform ${collapsed ? '' : 'rotate-180'}`}>{Icons.render('chevronDownOutline')}</span>
              </button>
            </h3>)
          : (
            <div className="mt-2 flex justify-between items-end gap-3">
              <h3 className="min-w-0">{titleBlock}</h3>
              {!!RightComponent && !!props.headerRightComponentProps && <RightComponent {...props.headerRightComponentProps} />}
            </div>)}
        {!props.hasHeaderOnlyStyle && !collapsed && <hr className="ui-divider mt-4" />}
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
