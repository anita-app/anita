import React from 'react'
import { ISectionElement } from 'app/models/section-element/section-element.declarations'
import { useSortBy, useTable, Column, CellPropGetter, CellValue, Row, TableCellProps } from 'react-table'
import { Section } from 'app/models/section/section.class'
import { FORM_COMPONENTS_CODES } from 'app/components/shared-components/forms-automator/form-component-codes.enum'
import { ProjectSectionListTableTd } from 'app/components/project/section/list/table/table-td'

export type IColumnExtended = Column<ISectionElement> & {
  componentCode: FORM_COMPONENTS_CODES
}

export interface UseTableCellProps {
  column: IColumnExtended
  row: Row<ISectionElement>
  value: CellValue<string | number | boolean>
  getCellProps: (propGetter?: CellPropGetter<ISectionElement>) => TableCellProps
  render: (type: 'Cell' | string, userProps?: object) => React.ReactNode
}
interface HeaderGroupFix {
  getSortByToggleProps: () => any
}

interface IProjectSectionListTableProps {
  section: Section
  sectionData: Array<ISectionElement>
  columns: Array<IColumnExtended>
}

export const ProjectSectionListTable: React.FC<IProjectSectionListTableProps> = (props) => {
  const {
    headerGroups,
    rows,
    prepareRow
  } = useTable({ columns: props.columns, data: props.sectionData }, useSortBy)

  return (
    <table className="table-auto min-w-full divide-y divide-gray-300">
      <thead>
        {headerGroups.map((headerGroup, indexTr) => (
          <tr key={`tr-${indexTr}`}>
            {headerGroup.headers.map((column, indexTh) => (
              <th
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 md:pl-0"
                {...column.getHeaderProps((column as unknown as HeaderGroupFix).getSortByToggleProps())}
                key={`tr-${indexTh}-tr-${indexTh}`}
              >
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className="divide-y divide-gray-200">
        {rows.map((row, index) => {
          prepareRow(row)
          return (
            <tr className="whitespace-nowrap" key={`row-tr-${index}`}>
              {row.cells.map(cell => (
                <ProjectSectionListTableTd
                  key={`${cell.column.id}${cell.row.id}`}
                  cell={cell as unknown as UseTableCellProps}
                  sectionId={props.section.id}
                />
              ))}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
