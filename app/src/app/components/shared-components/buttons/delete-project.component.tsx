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
import { getDropboxErrorMessage } from 'app/libs/cloud-sync/dropbox/dropbox-error.class'
import { DROPBOX_REMOTE_ID } from 'app/libs/cloud-sync/dropbox/dropbox.const'
import { LOCAL_FILE_REMOTE_ID } from 'app/libs/cloud-sync/local-file/local-file.const'
import { SyncStateAtoms } from 'app/state/sync/sync-state.atoms'
import { useAtomValue } from 'jotai'
import type { FC } from 'react'
import type { IProjectSettings } from 'app/models/project/project.declarations'

interface IDeleteProjectButtonProps {
  project: IProjectSettings
}

/** @featurePart project.info-page, project.delete, sync.dropbox-projects, sync.wordpress-share, sync.local-file-projects */
export const DeleteProjectButton: FC<IDeleteProjectButtonProps> = (props) => {
  const dropboxLink = useAtomValue(SyncStateAtoms.dropboxLinks)[props.project.id]
  const isOnDropbox = props.project.remoteStorage === DROPBOX_REMOTE_ID && !!dropboxLink
  const localFile = useAtomValue(SyncStateAtoms.localFileLinks)[props.project.id]
  const isOnLocalFile = props.project.remoteStorage === LOCAL_FILE_REMOTE_ID
  const remoteInfo = useRemoteProjectInfo(props.project.remoteStorage && props.project.remoteStorage !== DROPBOX_REMOTE_ID && !isOnLocalFile ? props.project.id : undefined)
  const isOnWordPress = !!remoteInfo
  const siteName = isOnWordPress ? (SyncState.getWordPressRemote(props.project.remoteStorage!)?.data.site_name ?? props.project.remoteStorage!) : ''

  const handleClickDelete = async (deleteOnRemote = true) => {
    try {
      await new ProjectDeletor(props.project.id).delete({ deleteOnRemote })
    } catch (error) {
      ModalState.showModal({
        title: 'The project was not deleted',
        type: Type.danger,
        hideCancelButton: true,
        children: <p className="text-sm text-gray-500">{isOnDropbox ? getDropboxErrorMessage(error) : getWordPressErrorMessage(error, siteName)} The project has been kept on this device.</p>,
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
    if (isOnDropbox) {
      // Deleting the file in Dropbox needs an explicit choice: the other answer only deletes the copy on this device.
      ModalState.showModal({
        title: 'Delete Project',
        type: Type.danger,
        ctas: [
          { actionText: 'Delete from this device only', actionType: Type.secondary, handleClickAction: () => handleClickDelete(false) },
          { actionText: 'Delete also from Dropbox', actionType: Type.danger, handleClickAction: () => handleClickDelete(true) },
        ],
        children: (
          <p className="text-sm text-gray-500">
            This project is synced with Dropbox{dropboxLink?.path ? <> ({dropboxLink.path})</> : null}. Do you also want to delete its file from your Dropbox?
            <br /><br /><strong>Delete from this device only</strong>: the file stays in your Dropbox and your other devices keep syncing it. This device will no longer download it; use &quot;Open from Dropbox&quot; to get it back.
            <br /><br /><strong>Delete also from Dropbox</strong>: the file is moved to the deleted files of your Dropbox, where you can restore it for a while. Your other devices will ask what to do with their copy.
          </p>),
      })
      return
    }
    ModalState.showModal({
      title: 'Delete Project',
      type: Type.danger,
      ctas: [{
        actionText: 'Delete',
        handleClickAction: () => handleClickDelete(),
      }],
      children: isOnWordPress
        ? (
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this project?<br /><br />It will be deleted from {siteName} and from this device, for every user it is shared with. This action cannot be undone.
          </p>)
        : isOnLocalFile
          ? (
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this project?<br /><br />It will be removed from this browser. Its file{localFile ? <> ({localFile.name})</> : null} stays on your computer: you can import it again at any time.
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
