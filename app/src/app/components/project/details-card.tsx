import { availableSystems } from 'app/data/project-form-builder/project-info-builder.constant'
import { SectionElement } from 'app/models/section-element/section-element.class'
import { DeleteProjectButton } from 'app/components/shared-components/buttons/delete-project.component'
import { EditProjectButton } from 'app/components/shared-components/buttons/edit-project-button.component'
import { ExportButton } from 'app/components/shared-components/buttons/export-project-button.component'
import { CardFooter } from 'app/components/shared-components/common-ui-eles/card-footer.component'
import * as dateFormat from 'date-format'
import { ProjectAvatar } from 'app/components/shared-components/common-ui-eles/project-avatar.component'
import { WordPressSyncStatus } from 'app/components/project/wordpress-sync-status.component'
import type { FC } from 'react'
import type { IProjectSettings } from 'app/models/project/project.declarations'

interface IProjectDetailsCardProps {
  project: IProjectSettings
}

export const ProjectDetailsCard: FC<IProjectDetailsCardProps> = (props) => (
  <div className="p-5 md:p-6">
    <div className="flex items-start gap-4">
      <ProjectAvatar
        id={props.project.id}
        title={props.project.title}
        size="large"
      />
      <div className="min-w-0">
        <p className="ui-eyebrow">Project</p>
        <h1 className="ui-title text-xl break-words">{props.project.title}</h1>
        {props.project.description && <p className="text-[#5b6b80] mt-1">{props.project.description}</p>}
      </div>
    </div>
    <hr className="ui-divider my-5" />

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
      <div className="ui-field">
        <p className="ui-field-label">Created on</p>
        <p className="ui-field-value">{dateFormat('yyyy/MM/dd, at hh:mm', new Date(props.project.createdAt))}</p>
      </div>
      <div className="ui-field">
        <p className="ui-field-label">Storage method</p>
        <p className="ui-field-value">{SectionElement.txtByFieldValue(availableSystems, props.project.localStorage!)}</p>
      </div>
    </div>

    {props.project.remoteStorage && <WordPressSyncStatus project={props.project} />}

    <CardFooter className="mt-5! pt-4 border-t border-[#eef1f5] items-center!">
      <DeleteProjectButton project={props.project} />
      <div className="flex items-end">
        <ExportButton />
        <EditProjectButton project={props.project} />
      </div>
    </CardFooter>

  </div>
)
