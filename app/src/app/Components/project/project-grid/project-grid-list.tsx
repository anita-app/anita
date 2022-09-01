import React from 'react'
import { SectionElement } from 'app/data/project-structure/project-info'
import { ProjectGridListElement } from 'app/components/project/project-grid/project-grid-list-element'
import { FORM_COMPONENTS_CODES } from 'app/components/shared-components/forms-automator/form-component-codes.enum'
import { Manager } from 'app/libs/manager/Manager.class'

interface IProjectGridListProps {
  sectionId: string
  sectionData: Array<SectionElement>
}

export const ProjectGridList: React.FC<IProjectGridListProps> = (props) => {
  const titleKey = Manager.getCurrentProject().getSectionById(props.sectionId).getFirstUserDefinedField()?.fieldName
  const descriptionField = Manager.getCurrentProject().getSectionById(props.sectionId).getFirstFieldOfType([FORM_COMPONENTS_CODES.basicTextarea])
  return (
    <div role="list" className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4">
      {props.sectionData.map(element => (
        <ProjectGridListElement key={element.id} element={element} titleKey={titleKey} descriptionKey={descriptionField?.fieldName} />
      ))}
    </div>
  )
}
