import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { urlParamFiller } from 'app/libs/routing/url-param-fillers.function'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { useRemoteProjectInfo } from 'app/components/project/wordpress-sync-status.component'
import type { FC } from 'react'
import type { IProjectSettings } from 'app/models/project/project.declarations'

interface IEditButtonProps {
  project: IProjectSettings
}

export const EditProjectButton: FC<IEditButtonProps> = (props) => {
  const remoteInfo = useRemoteProjectInfo(props.project.remoteStorage ? props.project.id : undefined)

  // On WordPress, only the owner and administrators can change the structure of a project.
  if (props.project.remoteStorage && remoteInfo && !remoteInfo.canManage) {
    return null
  }

  return (
    <Button
      id="editProject"
      label="Edit Project"
      iconLeft="createOutline"
      type={Type.secondary}
      href={urlParamFiller(ANITA_URLS.projectEdit, [{ name: URL_PARAMS.projectId, value: props.project.id }])}
      hasTooltip={true}
      breakpoint={'sm'}
    />
  )
}
