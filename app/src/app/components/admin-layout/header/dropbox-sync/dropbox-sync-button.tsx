import { useAtomValue } from 'jotai'
import { Link } from 'react-router-dom'
import { DropboxIcon } from 'app/components/remotes/dropbox-icon.component'
import { useTippyTooltip } from 'app/components/hooks/tippy-tooltip'
import { ANITA_URLS } from 'app/libs/routing/anita-routes.constant'
import { DROPBOX_REMOTE_ID } from 'app/libs/cloud-sync/dropbox/dropbox.const'
import { SyncStateAtoms } from 'app/state/sync/sync-state.atoms'
import type { FC } from 'react'
import type { IDropboxAccountState } from 'app/libs/cloud-sync/dropbox/dropbox.const'

/**
 * Icon of the connected Dropbox account in the header, with its sync status. Opens the storage page.
 */
export const DropboxSyncButton: FC<{ account: IDropboxAccountState }> = (props) => {
  const status = useAtomValue(SyncStateAtoms.remotesStatus)[DROPBOX_REMOTE_ID]
  const id = 'dropboxRemote'

  let tooltip = 'Dropbox: synced'
  let ringClassName = 'ring-transparent'
  if (props.account.needsReauth) {
    tooltip = 'Dropbox: log in again to resume syncing'
    ringClassName = 'ring-red-500'
  } else if (status?.isSyncing) {
    tooltip = 'Dropbox: syncing…'
    ringClassName = 'ring-prussian-blue-400 animate-pulse'
  } else if (status?.error) {
    tooltip = 'Dropbox: last sync failed'
    ringClassName = 'ring-orange-500'
  }

  useTippyTooltip(id, tooltip)

  return (
    <Link
      id={id}
      to={ANITA_URLS.remotes}
      aria-label={tooltip}
      className={`rounded-xl ring-2 ring-offset-1 ${ringClassName}`}
    >
      <DropboxIcon sizeClassName="w-8 h-8" />
    </Link>
  )
}
