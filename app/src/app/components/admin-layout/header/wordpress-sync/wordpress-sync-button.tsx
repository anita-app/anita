import { useEffect } from 'react'
import { useAtomValue } from 'jotai'
import { SyncStateAtoms } from 'app/state/sync/sync-state.atoms'
import { WordpressHelper } from 'app/libs/cloud-sync/wordpress/wordpress-helper.class'
import type { FC } from 'react'

interface IWordPressSyncButtonProps {
  remoteId: string
}

const getFallbackText = (siteName: string) => {
  const words = siteName.split(' ')
  if (words.length >= 2) {
    return words[0][0].toUpperCase() + words[1][0].toUpperCase()
  }
  return siteName.substring(0, 2).toUpperCase()
}

export const WordPressSyncButton: FC<IWordPressSyncButtonProps> = (props) => {
  const remoteInfo = useAtomValue(SyncStateAtoms.remoteInfo[props.remoteId])

  useEffect(() => {
    WordpressHelper.instance.syncWithRemote(props.remoteId)
  }, [props.remoteId])

  if (!remoteInfo?.data || !remoteInfo.data.site_name) {
    return null
  }

  const handleClick = () => {
    WordpressHelper.instance.syncWithRemote(props.remoteId)
  }

  return (
    <>
      {!remoteInfo.data.icon_base_64 && (
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-300 text-white font-bold text-xs border-none"
          aria-label="WordPress Sync"
          onClick={handleClick}
        >
          {getFallbackText(remoteInfo.data.site_name)}
        </button>
      )}
      {remoteInfo.data.icon_base_64 && (
        <button
          className="w-8 h-8 p-1 rounded-full flex items-center justify-center border border-gray-300"
          aria-label="WordPress Sync"
          onClick={handleClick}
        >
          <img
            src={remoteInfo.data.icon_base_64}
            alt={remoteInfo.data.site_name}
            className="w-full h-full rounded-full"
          />
        </button>
      )}
    </>
  )
}
