import { ProjectSectionListGridElement } from 'app/components/project/section/list/grid/grid-element'
import { FORM_COMPONENTS_CODES } from 'app/components/shared-components/forms-automator/form-component-codes.enum'
import { Manager } from 'app/cross-refs-exports'
import type { FC } from 'react'
import type { ISectionElement } from 'app/models/section-element/section-element.declarations'

interface IProjectSectionListGridProps {
  sectionId: string
  sectionData: Array<ISectionElement>
}

export const ProjectSectionListGrid: FC<IProjectSectionListGridProps> = (props) => {
  const section = Manager.getCurrentProject()?.getSectionById(props.sectionId)!
  const titleField = section.getFirstUserDefinedField()
  const descriptionField = section.getFirstFieldOfType([FORM_COMPONENTS_CODES.richText])
  if (!titleField) {
    return null
  }
  return (
    <div
      role="list"
      className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4"
    >
      {props.sectionData.map(element => (
        <ProjectSectionListGridElement
          key={element.id}
          element={element}
          titleField={titleField!}
          descriptionKey={descriptionField?.fieldName!}
        />
      ))}
    </div>
  )
}
