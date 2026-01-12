import { ProjectSectionListGridElement } from 'app/components/project/section/list/grid/grid-element'
import { FORM_COMPONENTS_CODES } from 'app/components/shared-components/forms-automator/form-component-codes.enum'
import { Queriers } from 'app/libs/db-connector/common-helpers/Queriers'
import { Section } from 'app/models/section/section.class'
import { useLiveQuery } from 'dexie-react-hooks'
import { useAtomValue } from 'jotai'
import { RoutingAtoms } from 'app/state/routing/routing.atoms'
import { URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import type { ISectionElement } from 'app/models/section-element/section-element.declarations'
import type { FC } from 'react'

interface IProjectSectionListGridProps {
  sectionId: string
  sectionData: Array<ISectionElement>
}

export const ProjectSectionListGrid: FC<IProjectSectionListGridProps> = (props) => {
  const projectId = useAtomValue(RoutingAtoms.param(URL_PARAMS.projectId))!
  const sectionData = useLiveQuery(() => Queriers.getProjectSection(projectId, props.sectionId!), [projectId, props.sectionId])

  if (!sectionData) {
    return null
  }

  const section = new Section(projectId, sectionData!)
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
