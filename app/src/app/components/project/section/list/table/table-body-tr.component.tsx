import { ProjectSectionListTableBodyTrTd } from 'app/components/project/section/list/table/table-body-tr-td.component'
import { ProjectSectionListTableBodyTrTdWithLinkToDetails } from 'app/components/project/section/list/table/table-body-tr-td-with-link-to-details.component'
import { Icons } from 'app/libs/icons/icons.class'
import { memo } from 'react'
import type { CSSProperties, FC } from 'react'
import type { FormFieldsModel, TSupportedFormsTypes } from 'app/components/shared-components/forms-automator/form-automator.types'
import type { ISectionElement } from 'app/models/section-element/section-element.declarations'

interface ITableTbodyTrProps extends ISectionElement {
  element: ISectionElement
  sectionId: string
  columns: Array<FormFieldsModel<TSupportedFormsTypes>>
  titleFieldName?: string
  /** Position of the row, for the staggered entrance; capped so that long lists do not wait. */
  entranceIndex?: number
}

const MAX_ENTRANCE_DELAY_STEPS = 12

export const ProjectSectionListTableBodyTr: FC<ITableTbodyTrProps> = memo(function TableTbodyTr (props: ITableTbodyTrProps) {
  return (
    <tr
      className="ui-row whitespace-nowrap"
      style={{ '--d': Math.min(props.entranceIndex ?? 0, MAX_ENTRANCE_DELAY_STEPS) } as CSSProperties}
      key={`row-tr-${props.id}`}
    >
      {props.columns.map(column => (
        <ProjectSectionListTableBodyTrTd
          key={`row-${props.id}-${column.fieldName}`}
          column={column}
          {...props}
        />
      ))}
      <ProjectSectionListTableBodyTrTdWithLinkToDetails
        elementId={props.id}
        className="ui-row-go pr-2"
      >
        {Icons.render('chevronForwardOutline')}
      </ProjectSectionListTableBodyTrTdWithLinkToDetails>
    </tr>
  )
}, (prevProps, nextProps) => {
  // loop all props and check if they are the same
  for (const key in prevProps) {
    if (key !== 'element' && key !== 'entranceIndex' && prevProps[key] !== nextProps[key]) {
      return false
    }
  }
  return true
})
