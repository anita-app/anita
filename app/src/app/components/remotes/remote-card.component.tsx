import { useState, type FC } from 'react'
import { useAtomValue } from 'jotai'
import * as dateFormat from 'date-format'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { CardFooter } from 'app/components/shared-components/common-ui-eles/card-footer.component'
import { AlertWithDescription } from 'app/components/shared-components/alerts/alert-with-description'
import { WordPressAuth } from 'app/libs/cloud-sync/wordpress/wordpress-auth.class'
import { WordPressSync } from 'app/libs/cloud-sync/wordpress/wordpress-sync.class'
import { getWordPressErrorMessage } from 'app/libs/cloud-sync/wordpress/wordpress-api-error.class'
import { ModalState } from 'app/state/modal/modal-state.class'
import { ProjectsListAtoms } from 'app/state/projects-list/projects-list.atoms'
import { SyncStateAtoms } from 'app/state/sync/sync-state.atoms'
import type { IWordPressRemoteInfo } from 'app/libs/cloud-sync/wordpress/wordpress.const'

const ROLE_LABELS: Record<string, string> = {
  administrator: 'Administrator',
  editor: 'Editor',
  author: 'Author',
  contributor: 'Contributor',
  subscriber: 'Subscriber',
}

export const getSiteInitials = (siteName: string): string => {
  const words = siteName.trim().split(/\s+/)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return siteName.substring(0, 2).toUpperCase()
}

export const SiteIcon: FC<{ remote: IWordPressRemoteInfo; sizeClassName?: string }> = (props) => {
  const [hasImageError, setHasImageError] = useState(false)
  const sizeClassName = props.sizeClassName ?? 'w-10 h-10'
  if (props.remote.data.site_icon_url && !hasImageError) {
    return (
      <img
        src={props.remote.data.site_icon_url}
        alt=""
        className={`${sizeClassName} rounded-full border border-gray-200`}
        onError={() => setHasImageError(true)}
      />
    )
  }
  return (
    <span className={`${sizeClassName} rounded-full flex items-center justify-center bg-gray-300 text-white font-bold text-xs`}>
      {getSiteInitials(props.remote.data.site_name || props.remote.remoteId)}
    </span>
  )
}

/**
 * A connected WordPress site, with its status and actions.
 */
export const RemoteCard: FC<{ remote: IWordPressRemoteInfo }> = (props) => {
  const remote = props.remote
  const status = useAtomValue(SyncStateAtoms.remotesStatus)[remote.remoteId]
  const projects = useAtomValue(ProjectsListAtoms.projects).filter(project => project.remoteStorage === remote.remoteId)
  const siteName = remote.data.site_name || remote.remoteId

  const handleDisconnect = () => {
    ModalState.showModal({
      title: `Disconnect ${siteName}?`,
      type: Type.danger,
      children: (
        <div className="text-sm text-gray-600">
          <p>This device will stop syncing with {siteName}. Nothing is deleted on the site.</p>
          {projects.length > 0 && (
            <p className="mt-2">
              {projects.length === 1 ? 'One project of this site is' : `${projects.length} projects of this site are`} on this device. You can keep {projects.length === 1 ? 'it' : 'them'} as local {projects.length === 1 ? 'project' : 'projects'}, or delete {projects.length === 1 ? 'it' : 'them'} from this device.
            </p>
          )}
        </div>
      ),
      ctas: projects.length > 0
        ? [
            { actionText: 'Keep projects', actionType: Type.secondary, handleClickAction: () => WordPressSync.disconnectRemote(remote.remoteId, { deleteLocalProjects: false }) },
            { actionText: 'Delete from this device', handleClickAction: () => WordPressSync.disconnectRemote(remote.remoteId, { deleteLocalProjects: true }) },
          ]
        : [{ actionText: 'Disconnect', handleClickAction: () => WordPressSync.disconnectRemote(remote.remoteId, { deleteLocalProjects: false }) }],
    })
  }

  const handleReconnect = async () => {
    try {
      await WordPressAuth.reconnect(remote.remoteId)
    } catch (error) {
      ModalState.showModal({
        title: `Cannot reach ${siteName}`,
        hideCancelButton: true,
        children: <p className="text-sm text-gray-600">{getWordPressErrorMessage(error, siteName)}</p>,
        ctas: [{ actionText: 'OK' }],
      })
    }
  }

  return (
    <div className="mt-4 border-2 border-gray-200 border-opacity-60 rounded-lg bg-white">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <SiteIcon remote={remote} />
          <div className="min-w-0">
            <h2 className="title-font text-lg font-medium text-gray-900 truncate">{siteName}</h2>
            <a
              href={remote.data.site_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 underline truncate block"
            >
              {remote.data.site_url}
            </a>
          </div>
        </div>

        <p className="text-gray-600 text-xs">Logged in as:</p>
        <p className="text-md mb-3">{remote.data.user_display_name} ({ROLE_LABELS[remote.data.user_role] ?? remote.data.user_role}){!remote.data.can_create_projects && ' · cannot create projects on this site'}</p>

        <p className="text-gray-600 text-xs">Projects on this device:</p>
        <p className="text-md mb-3">{projects.length}</p>

        <p className="text-gray-600 text-xs">Status:</p>
        <p className="text-md">
          {remote.needsReauth && 'Login required'}
          {!remote.needsReauth && status?.isSyncing && 'Syncing…'}
          {!remote.needsReauth && !status?.isSyncing && status?.lastSync && `Synced on ${dateFormat('yyyy/MM/dd, at hh:mm', new Date(status.lastSync))}`}
          {!remote.needsReauth && !status?.isSyncing && !status?.lastSync && 'Connected'}
        </p>

        {(remote.needsReauth || status?.error) && (
          <div className="mt-3">
            <AlertWithDescription
              title={remote.needsReauth ? 'Log in again to resume syncing' : 'Last sync failed'}
              description={status?.error ?? `Your session on ${siteName} has expired. Your changes are kept on this device.`}
              type={Type.warning}
            />
          </div>
        )}

        <CardFooter>
          <Button
            id={`disconnect-${remote.remoteId}`}
            label="Disconnect"
            iconLeft="trashOutline"
            type={Type.danger}
            fill="outline"
            onClick={handleDisconnect}
          />
          <div className="flex items-end ml-auto">
            {remote.needsReauth
              ? (
                <Button
                  id={`reconnect-${remote.remoteId}`}
                  label="Log in again"
                  iconLeft="logInOutline"
                  type={Type.primary}
                  onClick={handleReconnect}
                  marginClassName=""
                />)
              : (
                <Button
                  id={`sync-${remote.remoteId}`}
                  label={status?.isSyncing ? 'Syncing' : 'Sync now'}
                  iconLeft="sync"
                  iconLeftClassName={status?.isSyncing ? 'animate-spin' : ''}
                  type={Type.secondary}
                  disabled={status?.isSyncing}
                  onClick={() => WordPressSync.syncRemote(remote.remoteId)}
                  marginClassName=""
                />)}
          </div>
        </CardFooter>
      </div>
    </div>
  )
}
