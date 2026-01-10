import { WordPressSyncButton } from 'app/components/admin-layout/header/wordpress-sync/wordpress-sync-button'
import type { FC } from 'react'

interface IWordPressSyncButtonsProps {
  remoteIds: Array<string>
}

export const WordPressSyncButtons: FC<IWordPressSyncButtonsProps> = (props) => (
  <div className="flex items-center space-x-2">
    {props.remoteIds.map((remoteId) => (
      <WordPressSyncButton
        key={remoteId}
        remoteId={remoteId}
      />
    ))}
  </div>
)
