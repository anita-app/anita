import React, { useMemo } from 'react'
import { SectionElement, ISection } from 'app/data/project-structure/project-info'
import { ProjectTableListTdWithLinkToDetails } from 'app/ui-react-components/project/project-table-list/project-table-list-td-with-link-to-details.component'
import { customRenderPicker } from 'app/ui-react-components/project/project-values-renderers/custom-render-picker.component'
import { useSortBy, useTable } from 'react-table'

/**
 * Builds the columns for the table with react-table looping through sectionInfo
 */
const useSectionInfo = (sectionInfo: ISection) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const colsToShoww = useMemo(() => [], [sectionInfo.id, sectionInfo.formModel])
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

interface IProjectTableListProps {
  sectionInfo: ISection
  sectionData: Array<SectionElement>
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
          <tr key={`tr-${indexTr}`} {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column, indexTh) => (
              <th key={`tr-${indexTh}-tr-${indexTh}`} className="px-6 py-2 text-xs text-gray-500 text-left" {...column.getHeaderProps(column.getSortByToggleProps())}>
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
            <tr key={`row-tr-${index}`} className="whitespace-nowrap" {...row.getRowProps()}>
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
