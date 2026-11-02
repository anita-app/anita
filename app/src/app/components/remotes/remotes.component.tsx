import { useAtomValue } from 'jotai'
import { ConnectWordPress } from 'app/components/remotes/connect-wordpress.component'
import { ConnectDropbox } from 'app/components/remotes/connect-dropbox.component'
import { RemoteCard } from 'app/components/remotes/remote-card.component'
import { DropboxRemoteCard } from 'app/components/remotes/dropbox-remote-card.component'
import { useDropboxAccount } from 'app/components/remotes/dropbox-icon.component'
import { SyncStateAtoms } from 'app/state/sync/sync-state.atoms'
import { PageHeader } from 'app/components/shared-components/common-ui-eles/page-header.component'
import type { CSSProperties, FC } from 'react'

/**
 * Where projects can be stored besides this device: the Dropbox account and the WordPress sites connected here.
 * @featurePart sync.dropbox-connect, sync.wordpress-connect
 */
export const Remotes: FC = () => {
  const remotes = useAtomValue(SyncStateAtoms.wordPressRemotes)
  const dropboxAccount = useDropboxAccount()

  return (
    <div>
      <PageHeader
        eyebrow="Sync and share"
        title="Storage and sync"
        description="Keep your projects safe and on all your devices: in your Dropbox, or on your WordPress site to also share them with its users."
      />
      <div className="grid gap-4">
        <h2
          className="ui-eyebrow ui-rise mt-1"
          id="dropbox"
        >
          Dropbox
        </h2>
        {dropboxAccount
          ? <DropboxRemoteCard
              account={dropboxAccount}
              index={0}
            />
          : (
            <div className="ui-card ui-rise">
              <ConnectDropbox />
            </div>)}

        <h2
          className="ui-eyebrow ui-rise mt-4"
          id="wordpress"
        >
          WordPress sites
        </h2>
        {remotes.map((remote, index) => (
          <RemoteCard
            key={remote.remoteId}
            remote={remote}
            index={index + 1}
          />
        ))}
        <div
          className="ui-card ui-rise"
          style={{ '--d': remotes.length + 1 } as CSSProperties}
        >
          <ConnectWordPress />
        </div>
      </div>
    </div>
  )
}
