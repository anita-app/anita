import { SectionElement } from 'app/data/project-structure/project-info';
import { Section } from 'app/data/project-structure/project-info';
import { ProjectTableListTdWithLinkToDetails } from 'app/ui-react-components/project/table-list/project-table-list-td-with-link-to-details.component';
import { customRenderPicker } from 'app/ui-react-components/project/values-renderers/custom-render-picker.component';
import { useMemo } from 'react';
import { useSortBy, useTable } from 'react-table';

/**
 * Builds the columns for the table with react-table looping through sectionInfo
 */
const useSectionInfo = (sectionInfo: Section) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const colsToShoww = useMemo(() => [], [sectionInfo.id, sectionInfo.formModel]);
  useMemo(
    () => {
      return sectionInfo.formModel.forEach(formModel => {
        if (sectionInfo.id && formModel.label)
          colsToShoww.push({
            Header: formModel.label,
            accessor: formModel.fieldName,
            Cell: customRenderPicker(formModel),
          });
      }
      )
    },

    [sectionInfo.id, sectionInfo.formModel, colsToShoww]
  )
  return colsToShoww;
}

interface IProjectTableListProps {
  sectionInfo: Section
  sectionData: Array<SectionElement>
}

export const ProjectTableList: React.FC<IProjectTableListProps> = ({ sectionInfo, sectionData }) => {
  const columns = useSectionInfo(sectionInfo);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data: sectionData }, useSortBy);

  return (
    // apply the table props
    <table className="table-auto w-full divide-y divide-gray-200" {...getTableProps()}>
      <thead className="bg-gray-50">
        {// Loop over the header rows
          headerGroups.map(headerGroup => (
            // Apply the header row props
            <tr {...headerGroup.getHeaderGroupProps()}>
              {// Loop over the headers in each row
                headerGroup.headers.map(column => (
                  // Apply the header cell props
                  <th className="px-6 py-2 text-xs text-gray-500 text-left" {...column.getHeaderProps(column.getSortByToggleProps())}>
                    {// Render the header
                      column.render('Header')}
                  </th>
                ))}
            </tr>
          ))}
      </thead>
      {/* Apply the table body props */}
      <tbody className="divide-y divide-gray-200" {...getTableBodyProps()}>
        {// Loop over the table rows
          rows.map(row => {
            // Prepare the row for display
            prepareRow(row)
            return (
              // Apply the row props
              <tr className="whitespace-nowrap" {...row.getRowProps()}>
                {// Loop over the rows cells
                  row.cells.map(cell => {
                    // TODO No Link to details for checkbox
                    // Apply the cell props
                    return (
                      <ProjectTableListTdWithLinkToDetails key={`${cell.column.id}${cell.row.id}`} tdProps={cell.getCellProps()} elementId={cell.row.original.id}>
                        {cell.render('Cell')}
                      </ProjectTableListTdWithLinkToDetails>
                    )
                  })}
              </tr>
            )
          })}
      </tbody>
    </table>
  )

}
