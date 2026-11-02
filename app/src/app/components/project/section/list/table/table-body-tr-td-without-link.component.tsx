import type { FC, ReactNode } from 'react'

interface IProjectSectionListTableTdWithoutLinkProps {
  children: ReactNode
}

/**
 * @feature record.inline-checkbox
 * @title Tick a checkbox without editing the record
 * @summary Changes a checkbox field (for example "Done") directly from the table or from the details page.
 * @where Table view of a section: the cells of checkbox fields. Details page of a record: the checkbox fields.
 * @usage Click the checkbox: the record is saved at once, without opening the edit form.
 * @options none
 * @rules Clicking a checkbox cell does not open the details of the record, unlike the other cells. The change is saved and synced like any edit of the record.
 * @errors none
 * @status stable
 * @since 0.16.1
 * @routes projectSectionElesList, projectSectionEleDetails
 * @related view.table, record.details
 */
export const ProjectSectionListTableBodyTrTdWithoutLink: FC<IProjectSectionListTableTdWithoutLinkProps> = (props) => (
  <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm text-[#334155] sm:pl-3">
    {props.children}
  </td>
)
