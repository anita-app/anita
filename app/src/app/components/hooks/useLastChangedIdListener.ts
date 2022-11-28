import React, { useEffect, useState } from 'react'
import { LAST_SYNCED_ID } from 'app/libs/cloud-sync/sync-manager.const'

export const useLastChangedIdListener = (lastChangedId: string) => {
  const [lastChangedAt, setLastChangedAt] = useState(Date.now())

  useEffect(() => {
    const updateLastChangedAt = (newValue: string | null) => {
      if (newValue === lastChangedId) {
        setLastChangedAt(Date.now())
      }
    }
    const lastChangedAtSubscription = LAST_SYNCED_ID.subscribe(updateLastChangedAt)
    return () => {
      lastChangedAtSubscription.unsubscribe()
    }
  }, [])

  return lastChangedAt
}
