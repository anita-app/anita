import { ISectionElement } from 'app/models/section-element/section-element.declarations'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { ProjectSectionListTable } from 'app/components/project/section/list/table/table.component'
import { ProjectSectionNoData } from 'app/components/project/section/no-data.component'
import { AddEditElementButton } from 'app/components/shared-components/buttons/add-edit-element-button.component'
import { MainContentContainer } from 'app/components/shared-components/common-ui-eles/main-content-container.component'
import React from 'react'
import { Tab } from '@headlessui/react'
import { ProjectSectionListGrid } from 'app/components/project/section/list/grid/grid'
import { SupportedViews } from 'app/models/section/view-settings.const'
import { Section } from 'app/models/section/section.class'
import { ListTabsHeaderRight } from 'app/components/project/section/list/list-tabs-header-right.component'

interface IProjectSectionListTabsProps {
  sectionId: string
  projectId: string
  section: Section
  sectionData: Array<ISectionElement>
  activeTab: SupportedViews
  handleTabClick: (tab: SupportedViews) => void
}

export const ProjectSectionListTabs: React.FC<IProjectSectionListTabsProps> = (props) => {
  if (props.sectionData.length === 0) {
    return <ProjectSectionNoData sectionId={props.sectionId!} sectionTitle={props.section.title} projectId={props.projectId!} />
  }

  return (
    <Tab.Group selectedIndex={props.activeTab} onChange={props.handleTabClick}>
      <MainContentContainer
        headerText={props.section.title}
        hasHeaderOnlyStyle={props.activeTab === 1}
        headerRightComponent={ListTabsHeaderRight}
        headerRightComponentProps={{ activeTab: props.activeTab, sectionId: props.sectionId }}
      >
        <Tab.Panels>
          <Tab.Panel>
            <ProjectSectionListTable section={props.section} sectionData={props.sectionData} />
          </Tab.Panel>
          <Tab.Panel>
            <ProjectSectionListGrid sectionId={props.section.id} sectionData={props.sectionData} />
          </Tab.Panel>
        </Tab.Panels>
        <AddEditElementButton projectId={props.projectId!} sectionId={props.sectionId!} mode={EDITOR_MODE.add} />
      </MainContentContainer>
    </Tab.Group>
  )
}
