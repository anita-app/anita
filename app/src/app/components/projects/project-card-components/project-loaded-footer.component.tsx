import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { urlParamFiller } from 'app/libs/routing/url-param-fillers.function'
import { IProjectSettings } from 'app/data/project-structure/project-info'
import { EditButton } from 'app/components/shared-components/buttons/edit-project-button.component'
import { ExportButton } from 'app/components/shared-components/buttons/export-project-button.component'
import React from 'react'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'

interface IProjectLoadedFooterProps {
  project: IProjectSettings
}

export const ProjectLoadedFooter: React.FC<IProjectLoadedFooterProps> = ({ project }) => (
  <div className="ml-auto">
    <ExportButton />
    <EditButton project={project} />
    <Button
      id="projectDetails"
      label="Project details"
      href={urlParamFiller(ANITA_URLS.projectDetails, [{ name: URL_PARAMS.projectId, value: project.id }])}
      type={Type.info}
      iconLeft="informationCircleOutline"
      marginClassName=''
      hasTooltip={true}
      breakpoint={'sm'}
    />
  </div>

)
