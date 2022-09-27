import { FormFieldsModel, TSupportedFormsTypes } from 'app/components/shared-components/forms-automator/form-automator.types'
import { FORM_COMPONENTS_CODES } from 'app/components/shared-components/forms-automator/form-component-codes.enum'
import { Icons } from 'app/libs/icons/icons.class'
import { Manager } from 'app/libs/manager/manager.class'
import React from 'react'

interface IProjectSectionListTableHeadThProps {
  sectionId: string
  col: FormFieldsModel<TSupportedFormsTypes>
}

export const ProjectSectionListTableHeadTh: React.FC<IProjectSectionListTableHeadThProps> = (props) => {
  const handleHeaderClick = () => {
    Manager.getCurrentProject()?.getSectionById(props.sectionId)?.setSorting(props.col.fieldName)
  }
  const [field, order] = Manager.getCurrentProject()?.getSectionById(props.sectionId)?.getSorting() || []
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
