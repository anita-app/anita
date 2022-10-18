import React from 'react'
import { DropboxHelper } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'

export const CloudSyncButtonConnect: React.FC = () => {
  const handleConnectClick = async () => {
    const authUrl = await new DropboxHelper().getAuthenticationUrl()
    window.open(authUrl as unknown as string, '_blank')
  }
  return (
    <div className="ml-auto">
      <Button
        id="cloud-sync-connect"
        label="Login with Dropbox"
        tooltip="Sync your project across devices with Dropbox"
        type={Type.transparent}
        iconLeft="cloudyOutline"
        onClick={handleConnectClick}
      />
    </div>
  )
}
