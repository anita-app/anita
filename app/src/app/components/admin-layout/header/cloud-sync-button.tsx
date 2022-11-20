import React, { memo, useCallback, useEffect } from 'react'
import { CloudSyncState } from 'app/libs/cloud-sync/cloud-sync.const'
import { CloudSyncButtonConnect } from 'app/components/admin-layout/header/cloud-sync-button-connect'
import { DropboxHelper } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'
import { CloudSyncButtonOpenFilePicker } from 'app/components/admin-layout/header/cloud-sync-button-open-file-picker'
import { CloudSyncButtonDoSync } from 'app/components/admin-layout/header/cloud-sync-button-do-sync'
import { CURRENT_PROJECT_SYNC_INFO } from 'app/libs/cloud-sync/sync-manager.const'
import { useMultiState } from 'app/components/hooks/multi-state.hook'

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
      const isAuthenticated = await DropboxHelper.instance.isAuthenticated()
      if (!projectId) {
        return
      }
      if (!isAuthenticated) {
        CURRENT_PROJECT_SYNC_INFO.cloudSyncState = CloudSyncState.NOT_CONNECTED
        return setState(CURRENT_PROJECT_SYNC_INFO)
      }
      const linkedFileId = await DropboxHelper.instance.getLinkedFileIdOrNull(projectId)
      if (!linkedFileId) {
        CURRENT_PROJECT_SYNC_INFO.cloudSyncState = CloudSyncState.NOT_LINKED
        return setState(CURRENT_PROJECT_SYNC_INFO)
      }

      CURRENT_PROJECT_SYNC_INFO.cloudSyncState = CloudSyncState.LINKED
      CURRENT_PROJECT_SYNC_INFO.linkedFileId = linkedFileId
      setState(CURRENT_PROJECT_SYNC_INFO)
    }

    getCloudSyncState()

    return () => {
      CURRENT_PROJECT_SYNC_INFO.cloudSyncState = CloudSyncState.NOT_CONNECTED
      CURRENT_PROJECT_SYNC_INFO.linkedFileId = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const setCloudSyncState = useCallback((cloudSyncState: CloudSyncState) => {
    setState({ cloudSyncState })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!state.cloudSyncState || !state.linkedFileId) {
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

  return (
    <CloudSyncButtonDoSync linkedFileId={state.linkedFileId} />
  )
})
