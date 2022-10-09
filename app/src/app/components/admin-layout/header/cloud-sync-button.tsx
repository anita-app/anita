import React from 'react'
import { DropboxHelper } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'

export const CloudSyncButton: React.FC = () => {
  const testDbx = async () => {
    /* const authUrl = await new DropboxHelper().getAuthenticationUrl()
    window.open(authUrl as unknown as string, '_blank') */
    new DropboxHelper().getFileListForPath()
  }
  return (
    <div className="ml-auto">
      <Button
        id="cloud-sync-button"
        label="Cloud Sync"
        tooltip="Sync your project with cloud storage"
        type={Type.transparent}
        iconLeft="cloudyOutline"
        onClick={testDbx}
      />
    </div>
  )
}
