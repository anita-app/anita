import React, { memo, useEffect, useState } from 'react'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { useShortcut } from 'app/components/hooks/use-shortcut'
import { RemoteAndLocalMerger } from 'app/libs/cloud-sync/remote-and-local-merger.class'
import { DropboxHelper } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'
import { IS_SYNCING } from 'app/libs/cloud-sync/sync-manager.const'

interface ICloudSyncButtonDoSyncProps {
  linkedFileId: string
}

export const CloudSyncButtonDoSync: React.FC<ICloudSyncButtonDoSyncProps> = memo(function CloudSyncButtonDoSync (props: ICloudSyncButtonDoSyncProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  const handleSyncClick = async (e: KeyboardEvent | React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    new RemoteAndLocalMerger(props.linkedFileId).sync()
  }

  useEffect(() => {
    const updateIsSyncing = (newValue: boolean) => {
      setIsSyncing(newValue)
    }
    const isSyncingSubscription = IS_SYNCING.subscribe(updateIsSyncing)
    return () => {
      isSyncingSubscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const checkIfShouldSync = async () => {
      const shouldSync = await DropboxHelper.instance.shouldSync(props.linkedFileId)
      if (shouldSync) {
        new RemoteAndLocalMerger(props.linkedFileId).sync()
      }
    }
    checkIfShouldSync()
    const interval = setInterval(checkIfShouldSync, 10000)
    return () => {
      clearInterval(interval)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
})
