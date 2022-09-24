import { ProjectSectionListTableTdWithLinkToDetails } from 'app/components/project/section/list/table/table-td-with-link-to-details.component'
import { ProjectSectionListTableTdWithoutLink } from 'app/components/project/section/list/table/table-td-without-link.component'
import { UseTableCellProps } from 'app/components/project/section/list/table/table.component'
import { FORM_COMPONENTS_CODES } from 'app/components/shared-components/forms-automator/form-component-codes.enum'
import React from 'react'

interface IProjectSectionListTableTdProps {
  cell: UseTableCellProps
}

export const ProjectSectionListTableTd: React.FC<IProjectSectionListTableTdProps> = (props) => {
  if (props.cell.column.componentCode === FORM_COMPONENTS_CODES.basicCheckbox) {
    return (
      <ProjectSectionListTableTdWithoutLink key={`${props.cell.column.id}${props.cell.row.id}`} tdProps={props.cell.getCellProps()}>
        {props.cell.render('Cell')}
      </ProjectSectionListTableTdWithoutLink>
    )
  }

  return (
    <ProjectSectionListTableTdWithLinkToDetails key={`${props.cell.column.id}${props.cell.row.id}`} tdProps={props.cell.getCellProps()} elementId={props.cell.row.original.id}>
      {props.cell.render('Cell')}
    </ProjectSectionListTableTdWithLinkToDetails>
  )
}
