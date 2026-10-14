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

const MAX_PILLS_PER_CARD = 2

export const ProjectSectionListGrid: FC<IProjectSectionListGridProps> = (props) => {
  const projectId = useAtomValue(RoutingAtoms.param(URL_PARAMS.projectId))!
  const sectionData = useLiveQuery(() => Queriers.getProjectSection(projectId, props.sectionId!), [projectId, props.sectionId])

  if (!sectionData) {
    return null
  }

  const section = new Section(projectId, sectionData!)
  const titleField = section.getTitleField()
  const descriptionField = section.getFirstFieldOfType([FORM_COMPONENTS_CODES.richText])
  // Under the title: up to two choice fields as pills, then the first date.
  const choiceFields = section.formModel
    .filter(field => field.label && field.fieldName !== titleField?.fieldName && [FORM_COMPONENTS_CODES.basicSelect, FORM_COMPONENTS_CODES.basicRadio].includes(Number(field.componentCode)))
    .slice(0, MAX_PILLS_PER_CARD)
  const dateField = section.formModel.find(field => field.label && field.fieldName !== titleField?.fieldName && Number(field.componentCode) === FORM_COMPONENTS_CODES.datePicker)

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
          metaFields={dateField ? [...choiceFields, dateField] : choiceFields}
        />
      ))}
    </div>
  )
}
