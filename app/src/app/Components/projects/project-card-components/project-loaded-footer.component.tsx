import { ANITA_URLS, URL_PARAMS } from 'app/libs/Routing/anita-routes.constant'
import { urlParamFiller } from 'app/libs/Routing/url-param-fillers.function'
import { IProjectSettings } from 'app/data/project-structure/project-info'
import { EditButton } from 'app/Components/shared-components/buttons/edit-project-button.component'
import { ExportButton } from 'app/Components/shared-components/buttons/export-project-button.component'
import React from 'react'
import { Button } from 'app/Components/shared-components/common-ui-eles/button.component'

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
      type="primary"
      icon="informationCircleOutline"
      marginClassName=''
      hasTooltip={true}
      breakpoint={'sm'}
    />
  </div>

)
