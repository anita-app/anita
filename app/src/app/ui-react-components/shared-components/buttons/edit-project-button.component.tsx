import { ANITA_URLS, URL_PARAMS } from 'app/anita-routes/anita-routes.constant'
import { urlParamFiller } from 'app/anita-routes/url-param-fillers.function'
import { IProjectSettings } from 'app/data/project-structure/project-info'
import React from 'react'
import { Button } from 'app/ui-react-components/shared-components/common-ui-eles/button.component'

interface IEditButtonProps {
  project: IProjectSettings
}

export const EditButton: React.FC<IEditButtonProps> = ({ project }) => (
  <Button
    id="editProject"
    label="Edit Project"
    icon="bi-pencil"
    type="secondary"
    href={urlParamFiller(ANITA_URLS.projectEdit, [{ name: URL_PARAMS.projectId, value: project.id }])}
    hasTooltip={true}
    breakpoint={'sm'}
  />
)
