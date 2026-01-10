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

export const ProjectSectionListTableContainer: FC<IProjectSectionListTableProps> = (props) => {
  const [field, order] = useAtomValue(props.section.sorting)
  useAtomValue(props.section.visibleColumnsInTableView)

  const sortedData = useCallback(() => field === null
    ? props.sectionData
    : sortViewData(props.sectionData, field, order)
  , [field, order, props.sectionData])

  return (
    <ProjectSectionListTable
      section={props.section}
      sectionData={sortedData()}
      columns={props.section.getVisibleColumnsInTableView()}
    />
  )
}
