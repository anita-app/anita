import { ANITA_URLS, URL_PARAMS } from 'app/libs/Routing/anita-routes.constant'
import { SectionElement } from 'app/data/project-structure/project-info'
import { EDITOR_MODE } from 'app/Components/editor-mode.enum'
import { ProjectTableList } from 'app/Components/project/project-table-list/project-table-list.component'
import { NoSectionData } from 'app/Components/project/project-no-section-data.component'
import { AddEditElementButton } from 'app/Components/shared-components/buttons/add-edit-element-button.component'
import { MainContentContainer } from 'app/Components/shared-components/common-ui-eles/main-content-container.component'
import { Loader } from 'app/Components/shared-components/loader/loader.component'
import React, { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { Tab } from '@headlessui/react'
import { ProjectGridList } from 'app/Components/project/project-grid/project-grid-list'
import { Manager } from 'app/libs/Manager/Manager.class'
import { Icons, TIconName } from 'app/libs/Icons/Icons.class'

const SUPPORTED_VIEWS: Array<TIconName> = ['/assets/icons/svg/table.svg', 'gridOutline']

function classNames (...classes) {
  return classes.filter(Boolean).join(' ')
}

export const SectionElementsList: React.FC = () => {
  const params = useParams()
  const projectId = params[URL_PARAMS.projectId]
  const sectionId = params[URL_PARAMS.sectionId]
  const [sectionData, setSectionData] = useState<Array<SectionElement>>(null)
  const [activeTab, setActiveTab] = useState<number>(1)

  useEffect(() => {
    let isMounted = true
    const getSectionData = async () => {
      const project = await Manager.getProjectById(projectId)

      if (!project) {
        return setSectionData(undefined)
      }

      const data = await project.getSectionById(sectionId).getAllElements()
      if (isMounted) {
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

  const sectionInfo = Manager.getCurrentProject().getSectionById(sectionId)

  if (!sectionInfo) {
    return null
  }

  if (sectionData.length === 0) {
    return <NoSectionData sectionId={sectionId} sectionTitle={sectionInfo.title} projectId={projectId} />
  }

  return (
    <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
      <MainContentContainer
        headerText={sectionInfo.title}
        hasHeaderOnlyStyle={activeTab === 1}
        headerRightComponent={(
          <Tab.List className="flex space-x-1 rounded-xl bg-prussian-blue-900/10 p-1 w-20">
            {SUPPORTED_VIEWS.map(view => (
              <Tab
                key={view}
                className={({ selected }) => classNames(
                  'flex items-center justify-center w-full rounded-lg text-sm font-medium leading-5',
                  selected
                    ? 'bg-white shadow'
                    : 'opacity- hover:bg-white/[0.12] hover:text-white'
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
        <AddEditElementButton projectId={projectId} sectionId={sectionId} mode={EDITOR_MODE.add} />
      </MainContentContainer>
    </Tab.Group>
  )
}
