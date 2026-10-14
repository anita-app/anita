import { useState, type CSSProperties, type FC } from 'react'
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
        className={`${sizeClassName} rounded-xl border border-[#e6ecf3] shadow-sm`}
        onError={() => setHasImageError(true)}
      />
    )
  }
  return (
    <span className={`${sizeClassName} ui-avatar ui-avatar-1 rounded-xl text-xs`}>
      {getSiteInitials(props.remote.data.site_name || props.remote.remoteId)}
    </span>
  )
}

/**
 * A connected WordPress site, with its status and actions.
 */
export const RemoteCard: FC<{ remote: IWordPressRemoteInfo; index?: number }> = (props) => {
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
    <div
      className="ui-card ui-pcard ui-rise"
      style={{ '--d': props.index ?? 0 } as CSSProperties}
    >
      <div className="p-5 md:p-6">
        <div className="flex items-center gap-4">
          <SiteIcon
            remote={remote}
            sizeClassName="w-11 h-11"
          />
          <div className="min-w-0 grow">
            <h2 className="ui-title text-lg truncate">{siteName}</h2>
            <a
              href={remote.data.site_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#5b6b80] hover:text-[#006fdf] underline underline-offset-2 truncate block"
            >
              {remote.data.site_url}
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4">
          <div className="ui-field">
            <p className="ui-field-label">Logged in as</p>
            <p className="ui-field-value">{remote.data.user_display_name} ({ROLE_LABELS[remote.data.user_role] ?? remote.data.user_role})</p>
            {!remote.data.can_create_projects && <p className="text-xs text-[#7a8799] mt-0.5">Cannot create projects on this site</p>}
          </div>
          <div className="ui-field">
            <p className="ui-field-label">Projects on this device</p>
            <p className="ui-field-value">{projects.length}</p>
          </div>
          <div className="ui-field">
            <p className="ui-field-label">Status</p>
            <p className="ui-field-value flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full shrink-0 ${remote.needsReauth || status?.error ? 'bg-orange-500' : status?.isSyncing ? 'bg-[#2d96ff] animate-pulse' : 'bg-emerald-500'}`} />
              {remote.needsReauth && 'Login required'}
              {!remote.needsReauth && status?.isSyncing && 'Syncing…'}
              {!remote.needsReauth && !status?.isSyncing && status?.lastSync && `Synced on ${dateFormat('yyyy/MM/dd, at hh:mm', new Date(status.lastSync))}`}
              {!remote.needsReauth && !status?.isSyncing && !status?.lastSync && 'Connected'}
            </p>
          </div>
        </div>

        {(remote.needsReauth || status?.error) && (
          <div className="mt-3">
            <AlertWithDescription
              title={remote.needsReauth ? 'Log in again to resume syncing' : 'Last sync failed'}
              description={status?.error ?? `Your session on ${siteName} has expired. Your changes are kept on this device.`}
              type={Type.warning}
            />
          </div>
        )}

        <CardFooter className="mt-5! pt-4 border-t border-[#eef1f5] items-center!">
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
