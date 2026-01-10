import { useLiveQuery } from 'dexie-react-hooks'
import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { ProjectSectionNoData } from 'app/components/project/section/no-data.component'
import { Loader } from 'app/components/shared-components/loader/loader.component'
import { Navigate } from 'react-router-dom'
import { Manager } from 'app/cross-refs-exports'
import { ProjectSectionListTabs } from 'app/components/project/section/list/tabs/list-tabs.component'
import { RESERVED_FIELDS } from 'app/models/reserved-fields.constant'
import { useAtomValue } from 'jotai'
import { RoutingAtoms } from 'app/state/routing/routing.atoms'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import type { FC } from 'react'
import type { SupportedViews } from 'app/models/section/view-settings.const'

export const ProjectSectionList: FC = () => {
  const projectId = useAtomValue(ProjectAtoms.projectId)!
  const sectionId = useAtomValue(RoutingAtoms.param(URL_PARAMS.sectionId))
  const section = useAtomValue(ProjectAtoms.sectionById(sectionId))
  const sectionData = useLiveQuery(() => section?.getAllElements() || null, [section], null)
  const activeTab = section?.getPreferredView() ?? null

  if (sectionData === undefined) {
    return <Navigate to={ANITA_URLS.projectsList} />
  }

  if (sectionData === null || activeTab === null || !section) {
    return <Loader />
  }

  if (sectionData.length === 0) {
    return (<ProjectSectionNoData
      sectionId={sectionId!}
      sectionTitle={section.title}
      projectId={projectId}
            />)
  }

  const handleTabClick = (tab: number) => {
    Manager.getCurrentProject()?.getSectionById(sectionId)?.setPreferredView(tab as SupportedViews)
  }

  return (
    <ProjectSectionListTabs
      projectId={projectId}
      projectUpdatedAt={Manager.getCurrentProject()?.getProjectProp(RESERVED_FIELDS.updatedAt)!}
      sectionId={sectionId!}
      activeTab={activeTab}
      section={section}
      sectionData={sectionData}
      handleTabClick={handleTabClick}
    />
  )
}
