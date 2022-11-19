import React, { useRef } from 'react'
import { DropboxHelper } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { liveQuery, Subscription } from 'dexie'
import { CloudSyncBase } from 'app/libs/cloud-sync/cloud-sync-base.class'
import { CloudSyncState, IDropboxTokens } from 'app/libs/cloud-sync/cloud-sync.const'
import { useModalContext } from 'app/components/shared-components/modals/modal-context'
import { FILE_PICKER_MODAL_CONFIG } from 'app/components/admin-layout/header/cloud-sync-file-picker'

interface ICloudSyncButtonConnectProps {
  setCloudSyncState: (cloudSyncState: CloudSyncState) => void
}

export const CloudSyncButtonConnect: React.FC<ICloudSyncButtonConnectProps> = (props) => {
  const { showModal } = useModalContext()
  const observerRef = useRef<Subscription | null>(null)
  const startObserver = () => {
    observerRef.current = liveQuery(() => CloudSyncBase.getDB().table('accounts').where({ service: 'dropbox' }).first())
      .subscribe({
        next: async (value: IDropboxTokens | undefined) => {
          if (value) {
            props.setCloudSyncState(CloudSyncState.NOT_LINKED)
            showModal(FILE_PICKER_MODAL_CONFIG)
          }
        }
      })
  }

  const handleConnectClick = async () => {
    const authUrl = await DropboxHelper.instance.getAuthenticationUrl()
    startObserver()
    window.open(authUrl as unknown as string, '_blank')
  }
  return (
    <Button
      id="cloud-sync-connect"
      label="Login with Dropbox"
      tooltip="Sync your project across devices with Dropbox"
      type={Type.transparent}
      iconLeft="cloudyOutline"
      onClick={handleConnectClick}
    />
  )
}
