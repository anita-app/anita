import React from 'react'
import { ISectionElement } from 'app/models/section-element/section-element.declarations'
import { Section } from 'app/models/section/section.class'
import { FormFieldsModel, TSupportedFormsTypes } from 'app/components/shared-components/forms-automator/form-automator.types'
import { ProjectSectionListTableBodyTr } from 'app/components/project/section/list/table/table-body-tr.component'
import { ProjectSectionListTableHeadTh } from 'app/components/project/section/list/table/table-head-th.component'

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
          <ProjectSectionListTableHeadTh key={`th-${col.fieldName}`} col={col} sectionId={props.section.id} />
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
