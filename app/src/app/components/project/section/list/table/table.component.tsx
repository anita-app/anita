import React from 'react'
import { ISectionElement } from 'app/models/section-element/section-element.declarations'
import { Section } from 'app/models/section/section.class'
import { FormFieldsModel, TSupportedFormsTypes } from 'app/components/shared-components/forms-automator/form-automator.types'
import { ProjectSectionListTableBodyTr } from 'app/components/project/section/list/table/table-body-tr.component'
import { FORM_COMPONENTS_CODES } from 'app/components/shared-components/forms-automator/form-component-codes.enum'

interface IProjectSectionListTableProps {
  section: Section
  sectionData: Array<ISectionElement>
  columns: Array<FormFieldsModel<TSupportedFormsTypes>>
}

export const ProjectSectionListTable: React.FC<IProjectSectionListTableProps> = (props) => (
  <table className="table-auto min-w-full divide-y divide-gray-300">
    <thead>
      <tr>
        {props.columns.map((col) => (
          <th
            key={`th-${col.fieldName}`}
            // eslint-disable-next-line eqeqeq
            className={`py-3.5 pl-4 pr-3 text-sm font-semibold text-gray-900 sm:pl-6 md:pl-0 ${col.componentCode != FORM_COMPONENTS_CODES.basicCheckbox ? 'text-left' : 'text-center'}`}
          >
            {col.label}
          </th>
        ))}
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {props.sectionData.map((element) => (
        <ProjectSectionListTableBodyTr
          key={element.id}
          element={element}
          columns={props.columns}
          sectionId={props.section.id} {...element}
        />
      ))}
    </tbody>
  </table>
)
