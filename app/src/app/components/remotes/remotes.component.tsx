import { useAtomValue } from 'jotai'
import { ConnectWordPress } from 'app/components/remotes/connect-wordpress.component'
import { RemoteCard } from 'app/components/remotes/remote-card.component'
import { SyncStateAtoms } from 'app/state/sync/sync-state.atoms'
import type { FC } from 'react'

/**
 * WordPress sites connected on this device.
 */
export const Remotes: FC = () => {
  const remotes = useAtomValue(SyncStateAtoms.wordPressRemotes)

  return (
    <div>
      <div className="md:w-full bg-white border-b-2 rounded border-white">
        <div className="flex items-center h-full border-t-2 border-prussian-blue-400 border-opacity-60 rounded justify-between">
          <div className="px-6 py-3">
            <h1 className="title-font text-md font-medium text-gray-900">WordPress sites</h1>
          </div>
        </div>
      </div>
      <div className="p-1 md:w-full">
        {remotes.map(remote => (
          <RemoteCard
            key={remote.remoteId}
            remote={remote}
          />
        ))}
        <div className="mt-4 border-2 border-gray-200 border-opacity-60 rounded-lg bg-white">
          <ConnectWordPress />
        </div>
      </div>
    </div>
  )
}
