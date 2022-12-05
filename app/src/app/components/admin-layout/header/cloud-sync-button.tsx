import React, { memo, useCallback, useEffect } from 'react'
import { CloudSyncState } from 'app/libs/cloud-sync/cloud-sync.const'
import { CloudSyncButtonConnect } from 'app/components/admin-layout/header/cloud-sync-button-connect'
import { DropboxHelper } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'
import { CloudSyncButtonOpenFilePicker } from 'app/components/admin-layout/header/cloud-sync-button-open-file-picker'
import { CloudSyncButtonDoSync } from 'app/components/admin-layout/header/cloud-sync-button-do-sync'
import { useMultiState } from 'app/components/hooks/multi-state.hook'
import { Manager } from 'app/libs/manager/manager.class'

interface ICloudSyncButtonProps {
  projectId: string
}

interface ICloudSyncButtonState {
  cloudSyncState: CloudSyncState | null
  linkedFileId: string | null
}

export const CloudSyncButton: React.FC<ICloudSyncButtonProps> = memo(function CloudSyncButton (props: ICloudSyncButtonProps) {
  const [state, setState] = useMultiState<ICloudSyncButtonState>({
    cloudSyncState: null,
    linkedFileId: null
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
        currentProject?.syncInfo.setCloudSyncState(CloudSyncState.NOT_CONNECTED)
        return setState({ cloudSyncState: CloudSyncState.NOT_CONNECTED })
      }
      const linkedFileId = await DropboxHelper.instance.getLinkedFileIdOrNull(projectId)
      if (!linkedFileId) {
        currentProject?.syncInfo.setCloudSyncState(CloudSyncState.NOT_LINKED)
        return setState({ cloudSyncState: CloudSyncState.NOT_LINKED })
      }

      currentProject?.syncInfo.setCloudSyncState(CloudSyncState.LINKED)
      currentProject?.syncInfo.setLinkedFileId(linkedFileId)
      setState({ cloudSyncState: CloudSyncState.LINKED, linkedFileId })
    }

    getCloudSyncState()

    return () => {
      const currentProject = Manager.getCurrentProject()
      currentProject?.syncInfo.setCloudSyncState(CloudSyncState.NOT_CONNECTED)
      currentProject?.syncInfo.setLinkedFileId(null)
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
      <CloudSyncButtonConnect setCloudSyncState={setCloudSyncState} />
    )
  }

  if (state.cloudSyncState === CloudSyncState.NOT_LINKED) {
    return (
      <CloudSyncButtonOpenFilePicker />
    )
  }

  if (!state.linkedFileId) {
    return null
  }

  return (
    <CloudSyncButtonDoSync linkedFileId={state.linkedFileId} />
  )
})
