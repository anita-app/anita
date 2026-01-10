import { memo, useCallback, useEffect } from 'react'
import { CloudSyncState } from 'app/libs/cloud-sync/cloud-sync.const'
import { DropboxSyncButtonConnect } from 'app/components/admin-layout/header/dropbox-sync/dropbox-sync-button-connect'
import { DropboxHelper } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'
import { DropboxSyncButtonOpenFilePicker } from 'app/components/admin-layout/header/dropbox-sync/dropbox-sync-button-open-file-picker'
import { DropboxSyncButtonDoSync } from 'app/components/admin-layout/header/dropbox-sync/dropbox-sync-button-do-sync'
import { useMultiState } from 'app/components/hooks/multi-state.hook'
import { Manager } from 'app/cross-refs-exports'
import type { FC } from 'react'

interface IDropboxSyncButtonProps {
  projectId: string
}

interface IDropboxSyncButtonState {
  cloudSyncState: CloudSyncState | null
  linkedFileId: string | null
}

export const DropboxSyncButton: FC<IDropboxSyncButtonProps> = memo(function CloudSyncButton (props: IDropboxSyncButtonProps) {
  const [state, setState] = useMultiState<IDropboxSyncButtonState>({
    cloudSyncState: null,
    linkedFileId: null,
  })

  const projectId = props.projectId

  useEffect(() => {
    const getCloudSyncState = async () => {
      const currentProject = Manager.getCurrentProject()
      const isAuthenticated = await DropboxHelper.instance.isAuthenticated()
      if (!projectId) {
        return
      }
      if (!isAuthenticated) {
        currentProject?.dropBoxSyncInfo.setCloudSyncState(CloudSyncState.NOT_CONNECTED)
        return setState({ cloudSyncState: CloudSyncState.NOT_CONNECTED })
      }
      const linkedFileId = await DropboxHelper.instance.getLinkedFileIdOrNull(projectId)
      if (!linkedFileId) {
        currentProject?.dropBoxSyncInfo.setCloudSyncState(CloudSyncState.NOT_LINKED)
        return setState({ cloudSyncState: CloudSyncState.NOT_LINKED })
      }

      currentProject?.dropBoxSyncInfo.setCloudSyncState(CloudSyncState.LINKED)
      currentProject?.dropBoxSyncInfo.setLinkedFileId(linkedFileId)
      setState({ cloudSyncState: CloudSyncState.LINKED, linkedFileId })
    }

    getCloudSyncState()

    return () => {
      const currentProject = Manager.getCurrentProject()
      currentProject?.dropBoxSyncInfo.setCloudSyncState(CloudSyncState.NOT_CONNECTED)
      currentProject?.dropBoxSyncInfo.setLinkedFileId(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const setCloudSyncState = useCallback((cloudSyncState: CloudSyncState) => {
    setState({ cloudSyncState })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  if (!state.cloudSyncState) {
    return null
  }

  if (state.cloudSyncState === CloudSyncState.NOT_CONNECTED) {
    return (
      <DropboxSyncButtonConnect setCloudSyncState={setCloudSyncState} />
    )
  }

  if (state.cloudSyncState === CloudSyncState.NOT_LINKED) {
    return (
      <DropboxSyncButtonOpenFilePicker />
    )
  }

  if (!state.linkedFileId) {
    return null
  }

  return (
    <DropboxSyncButtonDoSync linkedFileId={state.linkedFileId} />
  )
})
