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

/**
 * @feature view.grid
 * @title Grid (cards) view
 * @summary Shows the records of a section as cards, with their name, a few short values and a description.
 * @where List of a section, with the grid icon selected at the top right.
 * @usage Click the grid icon above the list. Click a card to open the details of the record.
 * @options none (the gear icon "Edit view" opens an "Edit Card Layout" window that has no settings yet).
 * @rules Each card shows the field that names the records as its title ("Untitled" when empty), then up to two choice fields (drop-down or radio buttons) and the first date field when they have a value, then the first rich text field of the section as description. Long descriptions are cut, with a fade only when they are actually cut. Cards are arranged in 1 to 4 columns depending on the width of the screen.
 * @errors none
 * @status stable
 * @since 0.14.0
 * @routes projectSectionElesList
 * @covers view:grid
 * @related view.switch-view, record.title
 */
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
