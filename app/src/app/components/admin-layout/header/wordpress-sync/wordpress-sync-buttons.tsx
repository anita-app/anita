import { useAtomValue } from 'jotai'
import { WordPressSyncButton } from 'app/components/admin-layout/header/wordpress-sync/wordpress-sync-button'
import { SyncStateAtoms } from 'app/state/sync/sync-state.atoms'
import type { FC } from 'react'

export const WordPressSyncButtons: FC = () => {
  const remotes = useAtomValue(SyncStateAtoms.wordPressRemotes)
  return (
    <div className="flex items-center space-x-2">
      {remotes.map((remote) => (
        <WordPressSyncButton
          key={remote.remoteId}
          remote={remote}
        />
      ))}
    </div>
  )
}
