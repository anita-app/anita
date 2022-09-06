import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { urlParamFiller } from 'app/libs/routing/url-param-fillers.function'
import { IProjectSettings } from 'app/models/project/project.declarations'
import React from 'react'
import { Button } from 'app/components-no/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components-no/shared-components/common-ui-eles/components.const'

interface IEditButtonProps {
  project: IProjectSettings
}

export const EditButton: React.FC<IEditButtonProps> = ({ project }) => (
  <Button
    id="editProject"
    label="Edit Project"
    iconLeft="createOutline"
    type={Type.secondary}
    href={urlParamFiller(ANITA_URLS.projectEdit, [{ name: URL_PARAMS.projectId, value: project.id }])}
    hasTooltip={true}
    breakpoint={'sm'}
  />
)
