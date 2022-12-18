import React, { useEffect, useRef, useState } from 'react'
import { LAST_SYNCED_ID } from 'app/libs/cloud-sync/sync-manager.const'
import { Subscription } from 'rxjs'

export const useIdLastChangedBySync = (lastChangedId: string | undefined) => {
  const subscriotionRef = useRef<Subscription>()
  const [lastChangedAt, setLastChangedAt] = useState(Date.now())

  useEffect(() => {
    const updateLastChangedAt = (newValue: string | null) => {
      if (newValue === lastChangedId) {
        setLastChangedAt(Date.now())
      }
    }
    if (subscriotionRef.current) {
      subscriotionRef.current.unsubscribe()
    }
    subscriotionRef.current = LAST_SYNCED_ID.subscribe(updateLastChangedAt)
    return () => {
      subscriotionRef.current?.unsubscribe()
    }
  }, [lastChangedId])

  return lastChangedAt
}
