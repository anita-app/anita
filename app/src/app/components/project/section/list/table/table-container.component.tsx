import { ProjectSectionListTable } from 'app/components/project/section/list/table/table.component'
import { ISectionElement } from 'app/models/section-element/section-element.declarations'
import { Section } from 'app/models/section/section.class'
import React, { useCallback, useEffect, useState } from 'react'

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

export const ProjectSectionListTableContainer: React.FC<IProjectSectionListTableProps> = (props) => {
  const setRefresh = useState<number>(0)[1]
  useEffect(() => {
    const refreshVisibleColumns = () => {
      setRefresh(Date.now())
    }
    const subscriptionVisibleCols = props.section.visibleColumnsInTableView.subscribe(refreshVisibleColumns)
    const subscriptionSorting = props.section.sorting.subscribe(refreshVisibleColumns)
    return () => {
      subscriptionVisibleCols.unsubscribe()
      subscriptionSorting.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.section])

  const [field, order] = props.section.getSorting()

  const sortedData = useCallback(() => field === null
    ? props.sectionData
    : sortViewData(props.sectionData, field, order)
  , [field, order, props.sectionData])

  return (
    <ProjectSectionListTable section={props.section} sectionData={sortedData()} columns={props.section.getVisibleColumnsInTableView()} />
  )
}
