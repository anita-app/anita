import { useRef } from 'react'
import { DropboxHelper } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { liveQuery } from 'dexie'
import { CloudSyncState } from 'app/libs/cloud-sync/cloud-sync.const'
import { FILE_PICKER_MODAL_CONFIG } from 'app/components/admin-layout/header/dropbox-sync/dropbox-sync-file-picker'
import { CloudSyncBase } from 'app/cross-refs-exports'
import { ModalState } from 'app/state/modal/modal-state.class'
import type { FC } from 'react'
import type { IDropboxTokens } from 'app/libs/cloud-sync/cloud-sync.const'
import type { Subscription } from 'dexie'

interface IDropboxSyncButtonConnectProps {
  setCloudSyncState: (cloudSyncState: CloudSyncState) => void
}

export const DropboxSyncButtonConnect: FC<IDropboxSyncButtonConnectProps> = (props) => {
  const observerRef = useRef<Subscription | null>(null)
  const startObserver = () => {
    observerRef.current = liveQuery(() => CloudSyncBase.getDB().table('accounts').where({ service: 'dropbox' }).first())
      .subscribe({
        next: async (value: IDropboxTokens | undefined) => {
          if (value) {
            props.setCloudSyncState(CloudSyncState.NOT_LINKED)
            ModalState.showModal(FILE_PICKER_MODAL_CONFIG)
          }
        },
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
      tooltip="Login with Dropbox to Sync your project across devices"
      tooltipContainerClassName="w-48"
      hasTooltip={true}
      type={Type.transparent}
      iconLeft="logoDropbox"
      onClick={handleConnectClick}
    />
  )
}
