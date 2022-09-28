import { ProjectSectionListTableBodyTrTdWithLinkToDetails } from 'app/components/project/section/list/table/table-body-tr-td-with-link-to-details.component'
import { ProjectSectionListTableBodyTrTdWithoutLink } from 'app/components/project/section/list/table/table-body-tr-td-without-link.component'
import { FormFieldsModel, TSupportedFormsTypes } from 'app/components/shared-components/forms-automator/form-automator.types'
import { FORM_COMPONENTS_CODES } from 'app/components/shared-components/forms-automator/form-component-codes.enum'
import { CheckBoxEditable } from 'app/components/shared-components/values-renderers/checkbox-editable.component'
import { customRenderPicker } from 'app/components/shared-components/values-renderers/custom-render-picker.component'
import { ISectionElement } from 'app/models/section-element/section-element.declarations'
import React, { memo } from 'react'

interface IProjectSectionListTableTdProps extends ISectionElement {
  element: ISectionElement
  sectionId: string
  column: FormFieldsModel<TSupportedFormsTypes>
  columns: Array<FormFieldsModel<TSupportedFormsTypes>>
}

export const ProjectSectionListTableBodyTrTd: React.FC<IProjectSectionListTableTdProps> = memo(function ProjectSectionListTableTd (props: IProjectSectionListTableTdProps) {
  if (props.column.componentCode === FORM_COMPONENTS_CODES.basicCheckbox) {
    return (
      <ProjectSectionListTableBodyTrTdWithoutLink key={`${props.id}${props.column.fieldName}`}>
        <CheckBoxEditable
          sectionId={props.sectionId}
          element={props.element}
          fieldName={props.column.fieldName}
        />
      </ProjectSectionListTableBodyTrTdWithoutLink>
    )
  }

  const Component = customRenderPicker(props.column)

  return (
    <ProjectSectionListTableBodyTrTdWithLinkToDetails key={`${props.id}${props.column.fieldName}`} elementId={props.id}>
      <Component value={props[props.column.fieldName]} />
    </ProjectSectionListTableBodyTrTdWithLinkToDetails>
  )
}, (prevProps, nextProps) => {
  for (const key in prevProps) {
    if (key !== 'element' && key !== 'columns' && key !== 'column' && prevProps[key] !== nextProps[key]) {
      return false
    } else if (key === 'columns') {
      if (prevProps.columns.map(col => col.fieldName).join(',') !== nextProps.columns.map(col => col.fieldName).join(',')) {
        return false
      }
    }
  }
  return true
})
