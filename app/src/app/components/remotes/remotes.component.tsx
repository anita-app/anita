import { useAtomValue } from 'jotai'
import { ConnectWordPress } from 'app/components/remotes/connect-wordpress.component'
import { RemoteCard } from 'app/components/remotes/remote-card.component'
import { SyncStateAtoms } from 'app/state/sync/sync-state.atoms'
import { PageHeader } from 'app/components/shared-components/common-ui-eles/page-header.component'
import type { CSSProperties, FC } from 'react'

/**
 * WordPress sites connected on this device.
 */
export const Remotes: FC = () => {
  const remotes = useAtomValue(SyncStateAtoms.wordPressRemotes)

  return (
    <div>
      <PageHeader
        eyebrow="Sync and share"
        title="WordPress sites"
      />
      <div className="grid gap-4">
        {remotes.map((remote, index) => (
          <RemoteCard
            key={remote.remoteId}
            remote={remote}
            index={index}
          />
        ))}
        <div
          className="ui-card ui-rise"
          style={{ '--d': remotes.length } as CSSProperties}
        >
          <ConnectWordPress />
        </div>
      </div>
    </div>
  )
}
