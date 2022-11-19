import React, { useState } from 'react'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { useShortcut } from 'app/components/hooks/use-shortcut'
import { SyncManager } from 'app/libs/cloud-sync/sync-manager.class'

interface ICloudSyncButtonDoSyncProps {
  linkedFileId: string
}

export const CloudSyncButtonDoSync: React.FC<ICloudSyncButtonDoSyncProps> = (props) => {
  const [isSyncing, setIsSyncing] = useState(false)
  const handleSyncClick = async (e: KeyboardEvent | React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsSyncing(true)
    new SyncManager(props.linkedFileId).sync()
  }

  useShortcut({ s: { withMetakey: true } }, handleSyncClick)

  return (
    <Button
      id="cloud-sync-button"
      label={isSyncing ? 'Syncing' : 'Sync'}
      tooltip={isSyncing ? 'Syncing with Dropbox' : 'Sync with Dropbox'}
      type={Type.transparent}
      iconLeft={isSyncing ? 'sync' : 'cloudyOutline'}
      onClick={handleSyncClick}
    />
  )
}
