import { useLiveQuery } from 'dexie-react-hooks'
import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { ProjectSectionNoData } from 'app/components/project/section/no-data.component'
import { Loader } from 'app/components/shared-components/loader/loader.component'
import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Manager } from 'app/cross-refs-exports'
import { SupportedViews } from 'app/models/section/view-settings.const'
import { ProjectSectionListTabs } from 'app/components/project/section/list/tabs/list-tabs.component'
import { useIdLastChangedBySync } from 'app/components/hooks/id-last-changed-by-sync'
import { Section } from 'app/models/section/section.class'
import { RESERVED_FIELDS } from 'app/models/reserved-fields.constant'
import { useAtomValue } from 'jotai'
import { RoutingAtoms } from 'app/state/routing/routing.atoms'

export const ProjectSectionList: React.FC = () => {
  const projectId = useAtomValue(RoutingAtoms.param(URL_PARAMS.projectId))
  const sectionId = useAtomValue(RoutingAtoms.param(URL_PARAMS.sectionId))
  const sectionData = useLiveQuery(async () => {
    const project = await Manager.getProjectById(projectId)
    if (!project || !project.getSectionById(sectionId)) {
      return undefined
    }
    return project!.getSectionById(sectionId)?.getAllElements()
  }, [projectId, sectionId], null)
  const [section, setSection] = useState<Section | null>(null)
  const [activeTab, setActiveTab] = useState<SupportedViews | null>(null)

  const sectionLastChangedBySyncAt = useIdLastChangedBySync(sectionId)

  useEffect(() => {
    const getSectionData = async () => {
      await Manager.getProjectById(projectId)
      setActiveTab(Manager.getCurrentProject()?.getSectionById(sectionId)?.getPreferredView()!)
      setSection(Manager.getCurrentProject()?.getSectionById(sectionId) ?? null)
    }

    getSectionData()
  }, [sectionId, projectId, sectionLastChangedBySyncAt])

  if (sectionData === undefined) {
    return <Navigate to={ANITA_URLS.projectsList} />
  }

  if (sectionData === null || activeTab === null || !section) {
    return <Loader />
  }

  if (sectionData.length === 0) {
    return <ProjectSectionNoData sectionId={sectionId!} sectionTitle={section.title} projectId={projectId!} />
  }

  const handleTabClick = (tab: number) => {
    setActiveTab(tab as SupportedViews)
    Manager.getCurrentProject()?.getSectionById(sectionId)?.setPreferredView(tab as SupportedViews)
  }

  return (
    <ProjectSectionListTabs
      projectId={projectId!}
      projectUpdatedAt={Manager.getCurrentProject()?.getProjectProp(RESERVED_FIELDS.updatedAt)!}
      sectionId={sectionId!}
      activeTab={activeTab}
      section={section}
      sectionData={sectionData}
      handleTabClick={handleTabClick}
    />
  )
}
