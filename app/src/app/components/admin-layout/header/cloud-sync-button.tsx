import React, { useEffect, useState } from 'react'
import { CloudSyncState } from 'app/libs/cloud-sync/cloud-sync.const'
import { CloudSyncButtonConnect } from 'app/components/admin-layout/header/cloud-sync-button-connect'
import { DropboxHelper } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'
import { useSelector } from 'react-redux'
import { AnitaStore } from 'app/libs/redux/reducers.const'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { CloudSyncButtonOpenFilePicker } from 'app/components/admin-layout/header/cloud-sync-button-open-file-picker'

export const CloudSyncButton: React.FC = () => {
  const [cloudSyncState, setCloudSyncState] = useState<CloudSyncState | undefined>(undefined)
  const project = useSelector((state: AnitaStore) => state.project)
  const projectId = project?.[RESERVED_AUDS_KEYS._settings]?.[0]?.id

  useEffect(() => {
    const getCloudSyncState = async () => {
      const isAuthenticated = await new DropboxHelper().isAuthenticated()
      if (!projectId) {
        return
      }
      if (!isAuthenticated) {
        return setCloudSyncState(CloudSyncState.NOT_CONNECTED)
      }
      const isLinked = await new DropboxHelper().isLinked(projectId)
      if (!isLinked) {
        return setCloudSyncState(CloudSyncState.NOT_LINKED)
      }
      setCloudSyncState(CloudSyncState.LINKED)
    }
    getCloudSyncState()
  }, [projectId])

  if (cloudSyncState === undefined) {
    return null
  }

  if (cloudSyncState === CloudSyncState.NOT_CONNECTED) {
    return (
      <CloudSyncButtonConnect />
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
