import { ANITA_URLS } from 'app/libs/routing/anita-routes.constant'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { ModalState } from 'app/state/modal/modal-state.class'
import { ProjectDeletor } from 'app/models/project/project-deletor.class'
import { ProjectState } from 'app/state/project/project-state.class'
import { RoutingState } from 'app/state/routing/routing-state.class'
import { Bucket } from 'app/state/bucket.state'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { SyncState } from 'app/state/sync/sync-state.class'
import { useRemoteProjectInfo } from 'app/components/project/wordpress-sync-status.component'
import { getWordPressErrorMessage } from 'app/libs/cloud-sync/wordpress/wordpress-api-error.class'
import type { FC } from 'react'
import type { IProjectSettings } from 'app/models/project/project.declarations'

interface IDeleteProjectButtonProps {
  project: IProjectSettings
}

export const DeleteProjectButton: FC<IDeleteProjectButtonProps> = (props) => {
  const remoteInfo = useRemoteProjectInfo(props.project.remoteStorage ? props.project.id : undefined)
  const isOnWordPress = !!props.project.remoteStorage && !!remoteInfo
  const siteName = props.project.remoteStorage ? (SyncState.getWordPressRemote(props.project.remoteStorage)?.data.site_name ?? props.project.remoteStorage) : ''

  const handleClickDelete = async () => {
    try {
      await new ProjectDeletor(props.project.id).delete()
    } catch (error) {
      ModalState.showModal({
        title: 'The project was not deleted',
        type: Type.danger,
        hideCancelButton: true,
        children: <p className="text-sm text-gray-500">{getWordPressErrorMessage(error, siteName)} The project has been kept on this device.</p>,
        ctas: [{ actionText: 'OK' }],
      })
      return
    }
    if (Bucket.general.get(ProjectAtoms.currentProject)?.getId() === props.project.id) {
      ProjectState.resetCurrentProject()
    }
    RoutingState.goTo(ANITA_URLS.projectsList)
  }

  const handleClickModal = () => {
    ModalState.showModal({
      title: 'Delete Project',
      type: Type.danger,
      ctas: [{
        actionText: 'Delete',
        handleClickAction: handleClickDelete,
      }],
      children: isOnWordPress
        ? (
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this project?<br /><br />It will be deleted from {siteName} and from this device, for every user it is shared with. This action cannot be undone.
          </p>)
        : (
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this project?<br /><br />All project data will be permanently removed from this device. This action cannot be undone.<br /><br />Data stored on other devices will not be affected.
          </p>),
    })
  }

  // On WordPress, only the owner and administrators can delete a project.
  if (isOnWordPress && !remoteInfo.canManage) {
    return null
  }

  return (
    <Button
      id="deleteProject"
      label="Delete Project"
      iconLeft="trashOutline"
      onClick={handleClickModal}
      breakpoint={'lg'}
      type={Type.danger}
      fill={'outline'}
      hasTooltip={true}
    />
  )
}
