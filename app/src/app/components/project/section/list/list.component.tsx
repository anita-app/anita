import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { ISectionElement } from 'app/models/section-element/section-element.declarations'
import { ProjectSectionNoData } from 'app/components/project/section/no-data.component'
import { Loader } from 'app/components/shared-components/loader/loader.component'
import React, { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { Manager } from 'app/libs/manager/manager.class'
import { SupportedViews } from 'app/models/section/view-settings.const'
import { ProjectSectionListTabs } from 'app/components/project/section/list/tabs/list-tabs.component'

export const ProjectSectionList: React.FC = () => {
  const params = useParams()
  const projectId = params[URL_PARAMS.projectId]
  const sectionId = params[URL_PARAMS.sectionId]
  const [sectionData, setSectionData] = useState<Array<ISectionElement> | undefined | null>(null)
  const [activeTab, setActiveTab] = useState<SupportedViews | null>(null)

  useEffect(() => {
    let isMounted = true
    const getSectionData = async () => {
      const project = await Manager.getProjectById(projectId)

      if (!project || !project.getSectionById(sectionId)) {
        return setSectionData(undefined)
      }

      const data = await project.getSectionById(sectionId)?.getAllElements()
      if (isMounted && data) {
        setActiveTab(Manager.getCurrentProject()?.getSectionById(sectionId)?.getPreferredView()!)
        setSectionData(data)
      }
    }

    if (isMounted) {
      getSectionData()
    }

    return () => {
      isMounted = false
    }
  }, [sectionId, projectId])

  if (sectionData === undefined) {
    return <Navigate to={ANITA_URLS.projectsList} />
  }

  const section = Manager.getCurrentProject()?.getSectionById(sectionId)

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
      projectUpdatedAt={Manager.getCurrentProject()?.getProjectProp('updatedAt')!}
      sectionId={sectionId!}
      activeTab={activeTab}
      section={section}
      sectionData={sectionData}
      handleTabClick={handleTabClick}
    />
  )
}
