import { ANITA_URLS, URL_PARAMS } from 'app/anita-routes/anita-routes.constant'
import { urlParamFiller } from 'app/anita-routes/url-param-fillers.function'
import { IProjectSettings } from 'app/data/project-structure/project-info'
import { EditButton } from 'app/ui-react-components/shared-components/buttons/edit-project-button.component'
import { ExportButton } from 'app/ui-react-components/shared-components/buttons/export-project-button.component'
import React from 'react'
import { Button } from 'app/ui-react-components/shared-components/common-ui-eles/button.component'

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
      textColorClassName="text-white"
      bgColorClassName="bg-prussian-blue-400 hover:bg-prussian-blue-500"
      icon='bi-info-circle'
      marginClassName=''
      hasTooltip={true}
      breakpoint={'sm'}
    />
  </div>

)
