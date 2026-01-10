import { memo, useEffect } from 'react'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { useShortcut } from 'app/components/hooks/shortcut'
import { RemoteAndLocalMerger } from 'app/libs/cloud-sync/remote-and-local-merger.class'
import { DropboxHelper } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'
import { useAtomValue } from 'jotai'
import { SyncStateAtoms } from 'app/state/sync/sync-state.atoms'
import { SupportedCloud } from 'app/cross-refs-exports'
import type { FC } from 'react'

interface IDropboxSyncButtonDoSyncProps {
  linkedFileId: string
}

export const DropboxSyncButtonDoSync: FC<IDropboxSyncButtonDoSyncProps> = memo(function DropboxSyncButtonDoSync (props: IDropboxSyncButtonDoSyncProps) {
  const isSyncing = useAtomValue(SyncStateAtoms.isSyncing)
  const handleSyncClick = async (e: KeyboardEvent | React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    new RemoteAndLocalMerger(props.linkedFileId, SupportedCloud.DROPBOX).sync()
  }

  useEffect(() => {
    const checkIfShouldSync = async () => {
      const shouldSync = await DropboxHelper.instance.shouldSync(props.linkedFileId)
      if (shouldSync) {
        new RemoteAndLocalMerger(props.linkedFileId, SupportedCloud.DROPBOX).sync()
      }
    }
    checkIfShouldSync()
    const interval = setInterval(checkIfShouldSync, 10000)
    return () => {
      clearInterval(interval)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useShortcut({ key: 's', withMetaKey: true, callback: handleSyncClick })

  return (
    <Button
      id="cloud-sync-button"
      label={isSyncing ? 'Syncing' : 'Sync'}
      breakpoint="md"
      tooltip={isSyncing ? 'Syncing with Dropbox' : 'Sync with Dropbox'}
      type={Type.transparent}
      iconLeft="sync"
      iconLeftClassName={isSyncing ? 'animate-spin' : ''}
      onClick={handleSyncClick}
    />
  )
})
