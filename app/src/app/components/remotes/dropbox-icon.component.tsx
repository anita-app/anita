import { useAtomValue } from 'jotai'
import { Icons } from 'app/libs/icons/icons.class'
import { SyncStateAtoms } from 'app/state/sync/sync-state.atoms'
import type { FC } from 'react'
import type { IDropboxAccountState } from 'app/libs/cloud-sync/dropbox/dropbox.const'

/**
 * Dropbox logo in the same tile used for WordPress sites.
 * @internal
 */
export const DropboxIcon: FC<{ sizeClassName?: string }> = (props) => (
  <span className={`${props.sizeClassName ?? 'w-10 h-10'} ui-avatar ui-avatar-dropbox rounded-xl text-lg`}>
    {Icons.render('logoDropbox')}
  </span>
)

/**
 * The Dropbox account connected on this device, if any.
 * @internal
 */
export const useDropboxAccount = (): IDropboxAccountState | null => useAtomValue(SyncStateAtoms.dropboxAccount)

/**
 * Whether projects can be saved in Dropbox right now: connected, with a valid session.
 * @internal
 */
export const useDropboxIsWritable = (): boolean => {
  const account = useDropboxAccount()
  return !!account && !account.needsReauth
}

/** @internal */
export const dropboxAccountLabel = (account: IDropboxAccountState | null): string => account?.accountName ?? account?.email ?? 'your Dropbox account'
