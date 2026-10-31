import { useLiveQuery } from 'dexie-react-hooks'
import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { ProjectSectionNoData } from 'app/components/project/section/no-data.component'
import { Loader } from 'app/components/shared-components/loader/loader.component'
import { Navigate } from 'react-router-dom'
import { ProjectSectionListTabs } from 'app/components/project/section/list/tabs/list-tabs.component'
import { RESERVED_FIELDS } from 'app/models/reserved-fields.constant'
import { useAtomValue } from 'jotai'
import { RoutingAtoms } from 'app/state/routing/routing.atoms'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { Queriers } from 'app/libs/db-connector/common-helpers/Queriers'
import { Section } from 'app/models/section/section.class'
import type { FC } from 'react'
import type { SupportedViews } from 'app/models/section/view-settings.const'

/**
 * @feature view.section-list
 * @title List of the records of a section
 * @summary Shows all the records of a section of the project, as a table or as cards.
 * @where Sidebar: click the name of a section of the open project.
 * @usage Click a section in the sidebar. The page shows the section title, the project name above it and the number of records; click a record to open its details, or the round "+" button at the bottom right to add one.
 * @options The records can be shown as a table or as cards (grid); the view chosen last is kept for each section.
 * @rules Records are listed in the order they were created (the table can be sorted by a column instead). When the section has no records, the page reads "Nothing here yet" and "There are no items in" followed by the section name, with a "Create a new entry" button. The list updates by itself when records change, also after a sync. If the section does not exist, the app goes back to the projects list.
 * @errors none
 * @status stable
 * @since 0.1.0
 * @routes projectSectionElesList
 * @related view.table, view.grid, view.switch-view, record.add, record.details
 */
export const ProjectSectionList: FC = () => {
  const projectId = useAtomValue(RoutingAtoms.param(URL_PARAMS.projectId))!
  const sectionId = useAtomValue(RoutingAtoms.param(URL_PARAMS.sectionId))
  const project = useAtomValue(ProjectAtoms.currentProject)
  const sectionData = useLiveQuery(() => Queriers.getProjectSection(projectId, sectionId!), [projectId, sectionId])
  const section = new Section(projectId, sectionData!)
  // Depends on the ids: `section` is a new object at every render, which would run the query in a loop.
  const sectionElements = useLiveQuery(() => Queriers.getElements(projectId, sectionId!), [projectId, sectionId], null)

  if (!section) {
    return null
  }

  const activeTab = section?.getPreferredView() ?? null

  if (sectionElements === undefined) {
    return <Navigate to={ANITA_URLS.projectsList} />
  }

  if (sectionElements === null || activeTab === null || !section || !project) {
    return <Loader />
  }

  if (sectionElements.length === 0) {
    return (
      <ProjectSectionNoData
        sectionId={sectionId!}
        sectionTitle={section.title}
        projectId={projectId}
      />
    )
  }

  const handleTabClick = (tab: number) => {
    section?.setPreferredView(tab as SupportedViews)
  }

  return (
    <ProjectSectionListTabs
      projectId={projectId}
      projectUpdatedAt={project.getProjectProp(RESERVED_FIELDS.updatedAt)!}
      sectionId={sectionId!}
      activeTab={activeTab}
      section={section}
      sectionData={sectionElements}
      handleTabClick={handleTabClick}
    />
  )
}
