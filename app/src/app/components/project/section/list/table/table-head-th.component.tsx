import { FORM_COMPONENTS_CODES } from 'app/components/shared-components/forms-automator/form-component-codes.enum'
import { Icons } from 'app/libs/icons/icons.class'
import { useAtomValue } from 'jotai'
import { useLiveQuery } from 'dexie-react-hooks'
import { Queriers } from 'app/libs/db-connector/common-helpers/Queriers'
import { RoutingAtoms } from 'app/state/routing/routing.atoms'
import { URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { Section } from 'app/models/section/section.class'
import type { FormFieldsModel, TSupportedFormsTypes } from 'app/components/shared-components/forms-automator/form-automator.types'
import type { FC } from 'react'

interface IProjectSectionListTableHeadThProps {
  sectionId: string
  col: FormFieldsModel<TSupportedFormsTypes>
}

export const ProjectSectionListTableHeadTh: FC<IProjectSectionListTableHeadThProps> = (props) => {
  const projectId = useAtomValue(RoutingAtoms.param(URL_PARAMS.projectId))!
  const sectionData = useLiveQuery(() => Queriers.getProjectSection(projectId, props.sectionId))

  if (!sectionData) {
    return null
  }

  const section = new Section(projectId, sectionData)

  const handleHeaderClick = () => {
    section?.setSorting(props.col.fieldName)
  }

  const [field, order] = section?.getSorting() || []

  return (
    <th
    // eslint-disable-next-line eqeqeq
      className={`py-3.5 pl-4 pr-3 text-sm font-semibold text-gray-900 sm:pl-6 md:pl-0 cursor-pointer relative ${props.col.componentCode != FORM_COMPONENTS_CODES.basicCheckbox ? 'text-left' : 'text-center'}`}
      onClick={handleHeaderClick}
    >
      {props.col.label}
      {field === props.col.fieldName && (
        <span className="absolute top-4 ml-1 opacity-60">
          {order === 'asc' ? Icons.render('arrowDown') : Icons.render('arrowUp')}
        </span>
      )}
    </th>
  )
}
