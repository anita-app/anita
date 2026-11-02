import { getTitleField, withTitleFieldFirst } from 'app/models/section/title-field.function'
import { ProjectSectionListTable } from 'app/components/project/section/list/table/table.component'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'
import type { FC } from 'react'
import type { ISectionElement } from 'app/models/section-element/section-element.declarations'
import type { Section } from 'app/models/section/section.class'

interface IProjectSectionListTableProps {
  section: Section
  sectionData: Array<ISectionElement>
}

/**
 * @feature view.table-sort
 * @title Sort a table by a column
 * @summary Orders the records of a table by the values of one column.
 * @where List of a section, table view: the column headers.
 * @usage Click a column header to sort by it in ascending order; click it again to switch to descending order. Click another header to sort by that column.
 * @options Ascending or descending, on one column at a time. Without a choice, records are in the order they were created.
 * @rules An arrow next to the header shows the sorted column and the direction. Empty values go last. The sorting is saved for each section in the project, so it is kept when you come back and is synced with the project.
 * @errors none
 * @status stable
 * @since 0.16.2
 * @routes projectSectionElesList
 * @covers view:table
 * @related view.table
 */
const sortViewData = (sectionData: Array<ISectionElement>, field: string, order: 'asc' | 'desc') => (
  sectionData.sort((a, b) => {
    const aVal = a[field]
    const bVal = b[field]
    if (aVal === bVal) {
      return 0
    }
    if (aVal === null) {
      return 1
    }
    if (bVal === null) {
      return -1
    }
    if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
      return order === 'asc' ? (aVal ? 1 : -1) : (aVal ? -1 : 1)
    }
    if (aVal < bVal) {
      return order === 'asc' ? -1 : 1
    }
    return order === 'asc' ? 1 : -1
  })
)

/**
 * @feature view.table
 * @title Table view
 * @summary Shows the records of a section as rows of a table, one column per field.
 * @where List of a section, with the table icon selected at the top right (the default view).
 * @usage Open a section from the sidebar. Click a row to open the details of the record; tick a checkbox directly in its cell to change it.
 * @options Which columns are shown (gear icon "Edit view") and the column used for sorting (click a header).
 * @rules The first column, in bold, is the field that names the records. When the pointer is over a row, an arrow appears at its end. Rows appear one after the other with a short animation. Long values stay on one line and a wide table scrolls sideways. Rich text and other values are shown as on the details page.
 * @errors none
 * @status stable
 * @since 0.1.0
 * @routes projectSectionElesList
 * @covers view:table
 * @related view.table-columns, view.table-sort, view.switch-view, record.title, record.inline-checkbox
 */
export const ProjectSectionListTableContainer: FC<IProjectSectionListTableProps> = (props) => {
  const [field, order] = useAtomValue(props.section.sorting)
  useAtomValue(props.section.visibleColumnsInTableView)

  const sortedData = useCallback(() => field === null
    ? props.sectionData
    : sortViewData(props.sectionData, field, order),
  [field, order, props.sectionData])

  return (
    <ProjectSectionListTable
      section={props.section}
      sectionData={sortedData()}
      columns={withTitleFieldFirst(props.section.getVisibleColumnsInTableView(), props.section.formModel)}
      titleFieldName={getTitleField(props.section.formModel)?.fieldName}
    />
  )
}
