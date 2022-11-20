import { availableSystems } from 'app/data/project-form-builder/project-info-builder.constant'
import { IProjectSettings } from 'app/models/project/project.declarations'
import { SectionElement } from 'app/models/section-element/section-element.class'
import { DeleteProjectButton } from 'app/components/shared-components/buttons/delete-project.component'
import { EditButton } from 'app/components/shared-components/buttons/edit-project-button.component'
import { ExportButton } from 'app/components/shared-components/buttons/export-project-button.component'
import { CardFooter } from 'app/components/shared-components/common-ui-eles/card-footer.component'
import * as dateFormat from 'date-format'
import React from 'react'

interface IProjectDetailsCardProps {
  project: IProjectSettings
}
export const ProjectDetailsCard: React.FC<IProjectDetailsCardProps> = (props) => (
  <div className="p-6">
    <h1 className="title-font text-lg font-medium text-gray-900 mb-3">{props.project.title}</h1>

    <p className="text-gray-600 text-xs">Description</p>
    <p className="text-lg mb-3">{props.project.description}</p>

    <p className="text-gray-600 text-xs">Created on:</p>
    <p className="text-md mb-3">{dateFormat('yyyy/MM/dd, at hh:mm', new Date(props.project.createdAt))}</p>

    <p className="text-gray-600 text-xs">Storage method:</p>
    <p className="text-md">{SectionElement.txtByFieldValue(availableSystems, props.project.localStorage!)}</p>

    <CardFooter>
      <DeleteProjectButton project={props.project} />
      <div className="flex items-end">
        <ExportButton />
        <EditButton project={props.project} />
      </div>
    </CardFooter>

  </div>
)
