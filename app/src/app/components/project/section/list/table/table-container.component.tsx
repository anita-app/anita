import { ProjectSectionListTable } from 'app/components/project/section/list/table/table.component'
import { ISectionElement } from 'app/models/section-element/section-element.declarations'
import { Section } from 'app/models/section/section.class'
import React, { useEffect, useState } from 'react'

interface IProjectSectionListTableProps {
  section: Section
  sectionData: Array<ISectionElement>
}

export const ProjectSectionListTableContainer: React.FC<IProjectSectionListTableProps> = (props) => {
  const setRefresh = useState<number>(0)[1]
  useEffect(() => {
    const refreshVisibleColumns = () => {
      setRefresh(Date.now())
    }
    const subscription = props.section.visibleColumnsInTableView.subscribe(refreshVisibleColumns)
    return () => {
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.section])

  return (
    <ProjectSectionListTable section={props.section} sectionData={props.sectionData} columns={props.section.getVisibleColumnsInTableView()} />
  )
}
