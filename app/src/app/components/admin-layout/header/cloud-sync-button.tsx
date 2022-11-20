import React, { useEffect, useState } from 'react'
import { CloudSyncState } from 'app/libs/cloud-sync/cloud-sync.const'
import { CloudSyncButtonConnect } from 'app/components/admin-layout/header/cloud-sync-button-connect'
import { DropboxHelper } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'
import { CloudSyncButtonOpenFilePicker } from 'app/components/admin-layout/header/cloud-sync-button-open-file-picker'
import { CloudSyncButtonDoSync } from 'app/components/admin-layout/header/cloud-sync-button-do-sync'
import { LOCAL_STORAGE_SYSTEMS } from 'app/data/local-dbs/local-storage-systems.enum'

interface ICloudSyncButtonProps {
  projectId: string
  localStorage: LOCAL_STORAGE_SYSTEMS
}

export const CloudSyncButton: React.FC<ICloudSyncButtonProps> = (props) => {
  const [cloudSyncState, setCloudSyncState] = useState<CloudSyncState | undefined>(undefined)
  const [linkedFileId, setLinkedFileId] = useState<string | undefined>(undefined)
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
      const linkedFileId = await DropboxHelper.instance.getLinkedFileIdOrNull(projectId)
      if (!linkedFileId) {
        return setCloudSyncState(CloudSyncState.NOT_LINKED)
      }
      setCloudSyncState(CloudSyncState.LINKED)
      setLinkedFileId(linkedFileId)
    }
    getCloudSyncState()
  })

  if (cloudSyncState === undefined || props.localStorage !== LOCAL_STORAGE_SYSTEMS.IndexedDB) {
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
    <CloudSyncButtonDoSync linkedFileId={linkedFileId!} />
  )
}
