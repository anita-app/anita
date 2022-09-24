import React, { useEffect } from 'react'
import { ISectionElement } from 'app/models/section-element/section-element.declarations'
import { ProjectSectionListTableTdWithLinkToDetails } from 'app/components/project/section/list/table/table-td-with-link-to-details.component'
import { customRenderPicker } from 'app/components/shared-components/values-renderers/custom-render-picker.component'
import { useSortBy, useTable, Column } from 'react-table'
import { Section } from 'app/models/section/section.class'
import { FormFieldsModel, TSupportedFormsTypes } from 'app/components/shared-components/forms-automator/form-automator.types'

/**
 * Builds the columns for the table with react-table looping through sectionInfo
 */
const generateColumns = (visibleFormFields: Array<FormFieldsModel<TSupportedFormsTypes>>): Array<Column<ISectionElement>> => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const colsToShoww: Array<Column<ISectionElement>> = []
  visibleFormFields.forEach(formModel => {
    colsToShoww.push({
      Header: formModel.label,
      accessor: formModel.fieldName,
      Cell: customRenderPicker(formModel)
    })
  })
  return colsToShoww
}

interface HeaderGroupFix {
  getSortByToggleProps: () => any
}

interface IProjectSectionListTableProps {
  section: Section
  sectionData: Array<ISectionElement>
}

export const ProjectSectionListTable: React.FC<IProjectSectionListTableProps> = (props) => {
  const [columns, setColumns] = React.useState<Array<Column<ISectionElement>>>(generateColumns(props.section.getVisibleColumnsInTableView()))

  useEffect(() => {
    const refreshVisibleColumns = (visibleFormFields: Array<FormFieldsModel<TSupportedFormsTypes>>) => {
      setColumns(generateColumns(visibleFormFields))
    }

    if (!props.section.visibleColumnsInTableView.observed) {
      props.section.visibleColumnsInTableView.subscribe(refreshVisibleColumns)
    }
    return () => {
      props.section.visibleColumnsInTableView.unsubscribe()
    }
  }, [props.section])

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({ columns, data: props.sectionData }, useSortBy)

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
                <ProjectSectionListTableTdWithLinkToDetails key={`${cell.column.id}${cell.row.id}`} tdProps={cell.getCellProps()} elementId={cell.row.original.id}>
                  {cell.render('Cell')}
                </ProjectSectionListTableTdWithLinkToDetails>
              ))}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
