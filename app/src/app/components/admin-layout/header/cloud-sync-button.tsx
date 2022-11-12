import React, { useEffect, useState } from 'react'
import { CloudSyncState } from 'app/libs/cloud-sync/cloud-sync.const'
import { CloudSyncButtonConnect } from 'app/components/admin-layout/header/cloud-sync-button-connect'
import { DropboxHelper } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'
import { CloudSyncButtonOpenFilePicker } from 'app/components/admin-layout/header/cloud-sync-button-open-file-picker'

interface ICloudSyncButtonProps {
  projectId: string
}

export const CloudSyncButton: React.FC<ICloudSyncButtonProps> = (props) => {
  const [cloudSyncState, setCloudSyncState] = useState<CloudSyncState | undefined>(undefined)
  const projectId = props.projectId

  useEffect(() => {
    const getCloudSyncState = async () => {
      const isAuthenticated = await DropboxHelper.instance.isAuthenticated()
      if (!projectId) {
        return
      }
      if (!isAuthenticated) {
        return setCloudSyncState(CloudSyncState.NOT_CONNECTED)
      }
      const isLinked = await DropboxHelper.instance.isLinked(projectId)
      if (!isLinked) {
        return setCloudSyncState(CloudSyncState.NOT_LINKED)
      }
      setCloudSyncState(CloudSyncState.LINKED)
    }
    getCloudSyncState()
  })

  if (cloudSyncState === undefined) {
    return null
  }

  if (cloudSyncState === CloudSyncState.NOT_CONNECTED) {
    return (
      <CloudSyncButtonConnect setCloudSyncState={setCloudSyncState} />
    )
  }

  if (cloudSyncState === CloudSyncState.NOT_LINKED) {
    return (
      <CloudSyncButtonOpenFilePicker />
    )
  }

  return (
    <div className="ml-auto">
      not yet implemented
    </div>
  )
}
