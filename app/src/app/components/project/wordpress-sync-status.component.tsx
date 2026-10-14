import { useAtomValue } from 'jotai'
import { useLiveQuery } from 'dexie-react-hooks'
import * as dateFormat from 'date-format'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { AlertWithDescription } from 'app/components/shared-components/alerts/alert-with-description'
import { CloudSyncBase } from 'app/cross-refs-exports'
import { WordPressAuth } from 'app/libs/cloud-sync/wordpress/wordpress-auth.class'
import { WordPressSync } from 'app/libs/cloud-sync/wordpress/wordpress-sync.class'
import { ANITA_URLS } from 'app/libs/routing/anita-routes.constant'
import { SyncStateAtoms } from 'app/state/sync/sync-state.atoms'
import type { FC } from 'react'
import type { IProjectSettings } from 'app/models/project/project.declarations'

const formatDate = (isoDate: string): string => dateFormat('yyyy/MM/dd, at hh:mm', new Date(isoDate))

/**
 * Hook: what this device knows about a project synced with WordPress.
 */
export const useRemoteProjectInfo = (projectId: string | undefined) => (
  useLiveQuery(() => (projectId ? CloudSyncBase.getRemoteProjectInfo(projectId) : undefined), [projectId])
)

/**
 * Sync information and "Sync now" for a project linked to a WordPress site.
 */
export const WordPressSyncStatus: FC<{ project: IProjectSettings }> = (props) => {
  const project = props.project
  const remoteId = project.remoteStorage!
  const remote = useAtomValue(SyncStateAtoms.wordPressRemotes).find(entry => entry.remoteId === remoteId)
  const status = useAtomValue(SyncStateAtoms.projectsStatus)[project.id]
  const info = useRemoteProjectInfo(project.id)
  const lastSync = useLiveQuery(() => CloudSyncBase.getLastSync(project.id), [project.id, status?.lastSync])
  const siteName = remote?.data.site_name ?? remoteId
  const isOwner = !!info && !!remote && info.ownerId === remote.data.user_id

  if (!remote) {
    return (
      <div className="mb-3 space-y-2.5">
        <div className="ui-field">
          <p className="ui-field-label">Remote storage</p>
          <p className="ui-field-value">{remoteId}</p>
        </div>
        <AlertWithDescription
          title="This site is not connected on this device"
          description={`Connect ${remoteId} from the WordPress sites page to sync this project. Until then, changes are saved on this device only.`}
          type={Type.warning}
        />
        <Button
          id="goToRemotes"
          label="WordPress sites"
          iconLeft="logoWordpress"
          type={Type.secondary}
          href={ANITA_URLS.remotes}
          marginClassName="mt-2"
        />
      </div>
    )
  }

  return (
    <div className="mb-3 space-y-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="ui-field">
          <p className="ui-field-label">Remote storage</p>
          <p className="ui-field-value">
            {siteName}{' '}
            <a
              href={remote.data.site_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-normal text-sm text-[#5b6b80] hover:text-[#006fdf] underline underline-offset-2"
            >
              {remote.data.site_url}
            </a>
          </p>
        </div>

        {info && (
          <div className="ui-field">
            <p className="ui-field-label">Visible to</p>
            <p className="ui-field-value">
              {WordPressSync.describeAccessLevel(info.accessLevel)}
              {isOwner && ' · you own this project'}
              {!isOwner && !info.canManage && ' · shared with you: only its owner or an administrator can change its structure'}
            </p>
          </div>
        )}
      </div>

      <div className="ui-field flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="ui-field-label">Last sync</p>
          <p className="ui-field-value">
            {status?.isSyncing ? 'Syncing…' : ((status?.lastSync ?? lastSync) ? formatDate((status?.lastSync ?? lastSync)!) : 'Not synced yet')}
            {!status?.isSyncing && status?.pendingChanges && ' · some changes are not synced yet'}
          </p>
        </div>
        {!remote.needsReauth && (
          <Button
            id="syncProjectNow"
            label={status?.isSyncing ? 'Syncing' : 'Sync now'}
            iconLeft="sync"
            iconLeftClassName={status?.isSyncing ? 'animate-spin' : ''}
            type={Type.secondary}
            size="sm"
            disabled={status?.isSyncing}
            onClick={() => WordPressSync.syncProject(project.id)}
          />
        )}
      </div>

      {remote.needsReauth && (
        <div className="mb-2">
          <AlertWithDescription
            title={`Log in to ${siteName} again`}
            description="Your session has expired. Changes are kept on this device and will be synced once you log in."
            type={Type.warning}
          />
          <Button
            id="reconnectFromProject"
            label="Log in again"
            iconLeft="logInOutline"
            type={Type.primary}
            onClick={() => WordPressAuth.reconnect(remoteId)}
            marginClassName="mt-2"
          />
        </div>
      )}
      {!remote.needsReauth && status?.error && (
        <AlertWithDescription
          title="Sync problem"
          description={status.error}
          type={Type.warning}
        />
      )}
      {!status?.error && status?.notice && (
        <AlertWithDescription
          title="Synced"
          description={status.notice}
          type={Type.secondary}
        />
      )}
    </div>
  )
}
