import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { ISectionElement } from 'app/models/section-element/section-element.declarations'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { ProjectTableList } from 'app/components/project/project-table-list/project-table-list.component'
import { NoSectionData } from 'app/components/project/project-no-section-data.component'
import { AddEditElementButton } from 'app/components/shared-components/buttons/add-edit-element-button.component'
import { MainContentContainer } from 'app/components/shared-components/common-ui-eles/main-content-container.component'
import { Loader } from 'app/components/shared-components/loader/loader.component'
import React, { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { Tab } from '@headlessui/react'
import { ProjectGridList } from 'app/components/project/project-grid/project-grid-list'
import { Manager } from 'app/libs/manager/manager.class'
import { Icons } from 'app/libs/icons/icons.class'
import { SupportedViews, SUPPORTED_VIEWS_ICONS } from 'app/models/section/view-settings.const'

function classNames (...classes: Array<string>) {
  return classes.filter(Boolean).join(' ')
}

export const SectionElementsList: React.FC = () => {
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

  if (sectionData === null) {
    return <Loader />
  }

  const sectionInfo = Manager.getCurrentProject()?.getSectionById(sectionId)

  if (!sectionInfo) {
    return null
  }

  if (sectionData.length === 0) {
    return <NoSectionData sectionId={sectionId!} sectionTitle={sectionInfo.title} projectId={projectId!} />
  }

  const handleTabClick = (tab: number) => {
    setActiveTab(tab as SupportedViews)
    Manager.getCurrentProject()?.getSectionById(sectionId)?.setPreferredView(tab as SupportedViews)
  }

  if (activeTab === null) {
    return null
  }

  return (
    <Tab.Group selectedIndex={activeTab} onChange={handleTabClick}>
      <MainContentContainer
        headerText={sectionInfo.title}
        hasHeaderOnlyStyle={activeTab === 1}
        headerRightComponent={(
          <Tab.List className="flex space-x-1 rounded-xl bg-prussian-blue-900/10 p-1 w-20">
            {SUPPORTED_VIEWS_ICONS.map(view => (
              <Tab
                key={view}
                className={({ selected }) => classNames(
                  'flex items-center justify-center w-full rounded-lg text-sm font-medium leading-5 text-prussian-blue-700',
                  selected
                    ? 'bg-white shadow'
                    : 'hover:bg-white/[0.12] hover:text-prussian-blue-500'
                )}
              >
                {Icons.render(view)}
              </Tab>
            ))}
          </Tab.List>
        )}
      >
        <Tab.Panels>
          <Tab.Panel>
            <ProjectTableList sectionInfo={sectionInfo} sectionData={sectionData} />
          </Tab.Panel>
          <Tab.Panel>
            <ProjectGridList sectionId={sectionInfo.id} sectionData={sectionData} />
          </Tab.Panel>
        </Tab.Panels>
        <AddEditElementButton projectId={projectId!} sectionId={sectionId!} mode={EDITOR_MODE.add} />
      </MainContentContainer>
    </Tab.Group>
  )
}
