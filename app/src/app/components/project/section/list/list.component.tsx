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

export const ProjectSectionList: FC = () => {
  const projectId = useAtomValue(RoutingAtoms.param(URL_PARAMS.projectId))!
  const sectionId = useAtomValue(RoutingAtoms.param(URL_PARAMS.sectionId))
  const project = useAtomValue(ProjectAtoms.currentProject)
  const sectionData = useLiveQuery(() => Queriers.getProjectSection(projectId, sectionId!), [projectId, sectionId])
  const section = new Section(projectId, sectionData!)
  const sectionElements = useLiveQuery(() => Queriers.getElements(projectId, sectionId!), [section], null)

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
