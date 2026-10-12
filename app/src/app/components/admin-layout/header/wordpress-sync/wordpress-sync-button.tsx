import { useAtomValue } from 'jotai'
import { Link } from 'react-router-dom'
import { SiteIcon } from 'app/components/remotes/remote-card.component'
import { useTippyTooltip } from 'app/components/hooks/tippy-tooltip'
import { ANITA_URLS } from 'app/libs/routing/anita-routes.constant'
import { SyncStateAtoms } from 'app/state/sync/sync-state.atoms'
import type { FC } from 'react'
import type { IWordPressRemoteInfo } from 'app/libs/cloud-sync/wordpress/wordpress.const'

interface IWordPressSyncButtonProps {
  remote: IWordPressRemoteInfo
}

/**
 * Icon of a connected site in the header, with its sync status. Opens the WordPress sites page.
 */
export const WordPressSyncButton: FC<IWordPressSyncButtonProps> = (props) => {
  const remote = props.remote
  const status = useAtomValue(SyncStateAtoms.remotesStatus)[remote.remoteId]
  const siteName = remote.data.site_name || remote.remoteId
  const id = `wpRemote-${remote.remoteId.replace(/[^a-zA-Z0-9]/g, '-')}`

  let tooltip = `${siteName}: synced`
  let ringClassName = 'ring-transparent'
  if (remote.needsReauth) {
    tooltip = `${siteName}: log in again to resume syncing`
    ringClassName = 'ring-red-500'
  } else if (status?.isSyncing) {
    tooltip = `${siteName}: syncing…`
    ringClassName = 'ring-prussian-blue-400 animate-pulse'
  } else if (status?.error) {
    tooltip = `${siteName}: last sync failed`
    ringClassName = 'ring-orange-500'
  }

  useTippyTooltip(id, tooltip)

  return (
    <Link
      id={id}
      to={ANITA_URLS.remotes}
      aria-label={tooltip}
      className={`rounded-full ring-2 ring-offset-1 ${ringClassName}`}
    >
      <SiteIcon
        remote={remote}
        sizeClassName="w-8 h-8"
      />
    </Link>
  )
}
