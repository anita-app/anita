import React from 'react'
import { DropboxHelper } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'

export const CloudSyncButtonOpenFilePicker: React.FC = () => {
  const testDbx = async () => {
    const files = await new DropboxHelper().getFileListForPath()
    console.log('testDbx ~ files', files)
  }
  return (
    <div className="ml-auto">
      <Button
        id="cloud-sync-button"
        label="Connect with Dropbox"
        tooltip="Pick the file you want to sync with Dropbox"
        type={Type.transparent}
        iconLeft="cloudyOutline"
        onClick={testDbx}
      />
    </div>
  )
}
