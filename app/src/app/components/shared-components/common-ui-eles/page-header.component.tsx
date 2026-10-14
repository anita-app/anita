import type { FC, ReactNode } from 'react'

interface IPageHeaderProps {
  /** Small line above the title, e.g. "On this device" */
  eyebrow?: string
  title: string
  description?: ReactNode
  /** Buttons on the right */
  actions?: ReactNode
}

/**
 * Title of a page that is not a section of a project, e.g. the projects list or the WordPress sites.
 */
export const PageHeader: FC<IPageHeaderProps> = (props) => (
  <div className="flex flex-wrap items-end gap-3 mb-5">
    {/* Takes the free space, so the actions stay on the right until the page is narrow. */}
    <div className="ui-rise min-w-0 flex-1 basis-80">
      {props.eyebrow && <p className="ui-eyebrow">{props.eyebrow}</p>}
      <h1 className="ui-title text-2xl">{props.title}</h1>
      {props.description && <p className="text-sm text-[#5b6b80] mt-1 max-w-2xl">{props.description}</p>}
    </div>
    {props.actions && <div className="flex shrink-0 ml-auto [&>*:last-child]:mr-0">{props.actions}</div>}
  </div>
)
