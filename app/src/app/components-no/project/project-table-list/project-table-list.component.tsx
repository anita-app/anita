import React, { useMemo } from 'react'
import { ISectionElement } from 'app/models/section-element/section-element.declarations'
import { ISection } from 'app/models/section/section.declarations'
import { ProjectTableListTdWithLinkToDetails } from 'app/components-no/project/project-table-list/project-table-list-td-with-link-to-details.component'
import { customRenderPicker } from 'app/components-no/project/project-values-renderers/custom-render-picker.component'
import { useSortBy, useTable, Column } from 'react-table'

/**
 * Builds the columns for the table with react-table looping through sectionInfo
 */
const useSectionInfo = (sectionInfo: ISection) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const colsToShoww: Array<Column<ISectionElement>> = useMemo(() => [], [sectionInfo.id, sectionInfo.formModel])
  useMemo(
    () => sectionInfo.formModel.forEach(formModel => {
      if (sectionInfo.id && formModel.label) {
        colsToShoww.push({
          Header: formModel.label,
          accessor: formModel.fieldName,
          Cell: customRenderPicker(formModel)
        })
      }
    }
    ),

    [sectionInfo.id, sectionInfo.formModel, colsToShoww]
  )
  return colsToShoww
}

interface HeaderGroupFix {
  getSortByToggleProps: () => any
}

interface IProjectTableListProps {
  sectionInfo: ISection
  sectionData: Array<ISectionElement>
}

export const ProjectTableList: React.FC<IProjectTableListProps> = ({ sectionInfo, sectionData }) => {
  const columns = useSectionInfo(sectionInfo)

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({ columns, data: sectionData }, useSortBy)

  return (
    <table className="table-auto w-full divide-y divide-gray-200" {...getTableProps()}>
      <thead className="bg-gray-50">
        {headerGroups.map((headerGroup, indexTr) => (
          <tr {...headerGroup.getHeaderGroupProps()} key={`tr-${indexTr}`}>
            {headerGroup.headers.map((column, indexTh) => (
              <th className="px-6 py-2 text-xs text-gray-500 text-left" {...column.getHeaderProps((column as unknown as HeaderGroupFix).getSortByToggleProps())} key={`tr-${indexTh}-tr-${indexTh}`}>
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className="divide-y divide-gray-200" {...getTableBodyProps()}>
        {rows.map((row, index) => {
          prepareRow(row)
          // TODO No Link to details for checkbox
          return (
            <tr className="whitespace-nowrap" {...row.getRowProps()} key={`row-tr-${index}`}>
              {row.cells.map(cell => (
                <ProjectTableListTdWithLinkToDetails key={`${cell.column.id}${cell.row.id}`} tdProps={cell.getCellProps()} elementId={cell.row.original.id}>
                  {cell.render('Cell')}
                </ProjectTableListTdWithLinkToDetails>
              ))}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
