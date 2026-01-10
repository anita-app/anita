import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { urlParamFiller } from 'app/libs/routing/url-param-fillers.function'
import { EditProjectButton } from 'app/components/shared-components/buttons/edit-project-button.component'
import { ExportButton } from 'app/components/shared-components/buttons/export-project-button.component'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import type { FC } from 'react'
import type { IProjectSettings } from 'app/models/project/project.declarations'

interface IProjectLoadedFooterProps {
  project: IProjectSettings
}

export const ProjectLoadedFooter: FC<IProjectLoadedFooterProps> = (props) => (
  <div className="ml-auto">
    <ExportButton />
    <EditProjectButton project={props.project} />
    <Button
      id="projectDetails"
      label="Project details"
      href={urlParamFiller(ANITA_URLS.projectDetails, [{ name: URL_PARAMS.projectId, value: props.project.id }])}
      type={Type.info}
      iconLeft="informationCircleOutline"
      marginClassName=""
      hasTooltip={true}
      breakpoint={'sm'}
    />
  </div>

)
