import { useEffect, useState } from 'react'
import { useAtomValue } from 'jotai'
import { SyncStateAtoms } from 'app/state/sync/sync-state.atoms'

export const useIdLastChangedBySync = (lastChangedId: string | undefined) => {
  // eslint-disable-next-line react-hooks/purity
  const [lastChangedAt, setLastChangedAt] = useState(Date.now())
  const lastSyncedId = useAtomValue(SyncStateAtoms.lastSyncedId)

  useEffect(() => {
    if (lastSyncedId === lastChangedId) {
      setLastChangedAt(Date.now())
    }
  }, [lastChangedId, lastSyncedId])

  return lastChangedAt
}
