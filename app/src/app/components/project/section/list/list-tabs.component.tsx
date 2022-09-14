import { ISectionElement } from 'app/models/section-element/section-element.declarations'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { ProjectSectionListTable } from 'app/components/project/section/list/table/table.component'
import { ProjectSectionNoData } from 'app/components/project/section/no-data.component'
import { AddEditElementButton } from 'app/components/shared-components/buttons/add-edit-element-button.component'
import { MainContentContainer } from 'app/components/shared-components/common-ui-eles/main-content-container.component'
import React from 'react'
import { Tab } from '@headlessui/react'
import { ProjectSectionListGrid } from 'app/components/project/section/list/grid/grid'
import { Icons } from 'app/libs/icons/icons.class'
import { SupportedViews, SUPPORTED_VIEWS_ICONS } from 'app/models/section/view-settings.const'
import { Section } from 'app/models/section/section.class'

function classNames (...classes: Array<string>) {
  return classes.filter(Boolean).join(' ')
}

interface IProjectSectionListTabsProps {
  sectionId: string
  projectId: string
  sectionInfo: Section
  sectionData: Array<ISectionElement>
  activeTab: SupportedViews
  handleTabClick: (tab: SupportedViews) => void
}

export const ProjectSectionListTabs: React.FC<IProjectSectionListTabsProps> = (props) => {
  if (props.sectionData.length === 0) {
    return <ProjectSectionNoData sectionId={props.sectionId!} sectionTitle={props.sectionInfo.title} projectId={props.projectId!} />
  }

  return (
    <Tab.Group selectedIndex={props.activeTab} onChange={props.handleTabClick}>
      <MainContentContainer
        headerText={props.sectionInfo.title}
        hasHeaderOnlyStyle={props.activeTab === 1}
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
            <ProjectSectionListTable sectionInfo={props.sectionInfo} sectionData={props.sectionData} />
          </Tab.Panel>
          <Tab.Panel>
            <ProjectSectionListGrid sectionId={props.sectionInfo.id} sectionData={props.sectionData} />
          </Tab.Panel>
        </Tab.Panels>
        <AddEditElementButton projectId={props.projectId!} sectionId={props.sectionId!} mode={EDITOR_MODE.add} />
      </MainContentContainer>
    </Tab.Group>
  )
}
