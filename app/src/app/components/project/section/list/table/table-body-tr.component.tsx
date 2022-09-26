import { ProjectSectionListTableBodyTrTd } from 'app/components/project/section/list/table/table-body-tr-td.component'
import { FormFieldsModel, TSupportedFormsTypes } from 'app/components/shared-components/forms-automator/form-automator.types'
import { ISectionElement } from 'app/models/section-element/section-element.declarations'
import React, { memo } from 'react'

interface ITableTbodyTrProps extends ISectionElement {
  element: ISectionElement
  sectionId: string
  columns: Array<FormFieldsModel<TSupportedFormsTypes>>
}

export const ProjectSectionListTableBodyTr: React.FC<ITableTbodyTrProps> = memo(function TableTbodyTr (props: ITableTbodyTrProps) {
  return (
    <tr className="whitespace-nowrap" key={`row-tr-${props.id}`}>
      {props.columns.map(column => (
        <ProjectSectionListTableBodyTrTd
          key={`row-${props.id}-${column.fieldName}`}
          column={column}
          {...props}
        />
      ))}
    </tr>
  )
}, (prevProps, nextProps) => {
  // loop all props and check if they are the same
  for (const key in prevProps) {
    if (key !== 'element' && prevProps[key] !== nextProps[key]) {
      return false
    }
  }
  return true
})
