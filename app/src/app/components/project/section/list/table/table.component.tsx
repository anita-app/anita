import React, { useEffect } from 'react'
import { ISectionElement } from 'app/models/section-element/section-element.declarations'
import { customRenderPicker } from 'app/components/shared-components/values-renderers/custom-render-picker.component'
import { useSortBy, useTable, Column, CellPropGetter, CellValue, Row, TableCellProps } from 'react-table'
import { Section } from 'app/models/section/section.class'
import { FormFieldsModel, TSupportedFormsTypes } from 'app/components/shared-components/forms-automator/form-automator.types'
import { FORM_COMPONENTS_CODES } from 'app/components/shared-components/forms-automator/form-component-codes.enum'
import { ProjectSectionListTableTd } from 'app/components/project/section/list/table/table-td'

type IColumnExtended = Column<ISectionElement> & {
  componentCode: FORM_COMPONENTS_CODES
}

export interface UseTableCellProps {
  column: IColumnExtended
  row: Row<ISectionElement>
  value: CellValue<string | number>
  getCellProps: (propGetter?: CellPropGetter<ISectionElement>) => TableCellProps
  render: (type: 'Cell' | string, userProps?: object) => React.ReactNode
}

const generateColumns = (visibleFormFields: Array<FormFieldsModel<TSupportedFormsTypes>>): Array<IColumnExtended> => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const colsToShoww: Array<IColumnExtended> = []
  visibleFormFields.forEach(formModel => {
    colsToShoww.push({
      Header: formModel.label,
      accessor: formModel.fieldName,
      Cell: customRenderPicker(formModel),
      componentCode: formModel.componentCode
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
  const [columns, setColumns] = React.useState<Array<IColumnExtended>>(generateColumns(props.section.getVisibleColumnsInTableView()))

  useEffect(() => {
    const refreshVisibleColumns = (visibleFormFields: Array<FormFieldsModel<TSupportedFormsTypes>>) => {
      setColumns(generateColumns(visibleFormFields))
    }
    const subscription = props.section.visibleColumnsInTableView.subscribe(refreshVisibleColumns)
    setColumns(generateColumns(props.section.getVisibleColumnsInTableView()))
    return () => {
      subscription.unsubscribe()
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
          return (
            <tr className="whitespace-nowrap" {...row.getRowProps()} key={`row-tr-${index}`}>
              {row.cells.map(cell => (
                <ProjectSectionListTableTd key={`${cell.column.id}${cell.row.id}`} cell={cell as unknown as UseTableCellProps} />
              ))}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
