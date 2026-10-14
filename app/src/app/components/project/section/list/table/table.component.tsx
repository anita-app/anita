import { ProjectSectionListTableBodyTr } from 'app/components/project/section/list/table/table-body-tr.component'
import { ProjectSectionListTableHeadTh } from 'app/components/project/section/list/table/table-head-th.component'
import type { FC } from 'react'
import type { ISectionElement } from 'app/models/section-element/section-element.declarations'
import type { Section } from 'app/models/section/section.class'
import type { FormFieldsModel, TSupportedFormsTypes } from 'app/components/shared-components/forms-automator/form-automator.types'

interface IProjectSectionListTableProps {
  section: Section
  sectionData: Array<ISectionElement>
  columns: Array<FormFieldsModel<TSupportedFormsTypes>>
  /** Field naming the records, shown as the name of each row */
  titleFieldName?: string
}

export const ProjectSectionListTable: FC<IProjectSectionListTableProps> = (props) => (
  <table className="ui-table table-auto min-w-full">
    <thead>
      <tr>
        {props.columns.map((col) => (
          <ProjectSectionListTableHeadTh
            key={`th-${col.fieldName}`}
            col={col}
            sectionId={props.section.id}
          />
        ))}
        {/* Column of the arrow that appears on the hovered row */}
        <th aria-hidden="true" />
      </tr>
    </thead>
    <tbody>
      {props.sectionData.map((element, index) => (
        <ProjectSectionListTableBodyTr
          key={element.id}
          element={element}
          columns={props.columns}
          sectionId={props.section.id}
          titleFieldName={props.titleFieldName}
          entranceIndex={index}
          {...element}
        />
      ))}
    </tbody>
  </table>
)
