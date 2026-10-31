import { useAtomValue } from 'jotai'
import { useLiveQuery } from 'dexie-react-hooks'
import dateFormat from 'date-format'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { AlertWithDescription } from 'app/components/shared-components/alerts/alert-with-description'
import { dropboxAccountLabel, useDropboxAccount } from 'app/components/remotes/dropbox-icon.component'
import { reconnectDropbox } from 'app/components/remotes/dropbox-remote-card.component'
import { CloudSyncBase } from 'app/cross-refs-exports'
import { DropboxSync } from 'app/libs/cloud-sync/dropbox/dropbox-sync.class'
import { ANITA_URLS } from 'app/libs/routing/anita-routes.constant'
import { SyncStateAtoms } from 'app/state/sync/sync-state.atoms'
import type { FC } from 'react'
import type { IProjectSettings } from 'app/models/project/project.declarations'

const formatDate = (isoDate: string): string => dateFormat('yyyy/MM/dd, at hh:mm', new Date(isoDate))

/**
 * Sync information and "Sync now" for a project synced with Dropbox.
 */
export const DropboxSyncStatus: FC<{ project: IProjectSettings }> = (props) => {
  const project = props.project
  const account = useDropboxAccount()
  const link = useAtomValue(SyncStateAtoms.dropboxLinks)[project.id]
  const status = useAtomValue(SyncStateAtoms.projectsStatus)[project.id]
  const lastSync = useLiveQuery(() => CloudSyncBase.getLastSync(project.id), [project.id, status?.lastSync])

  if (!account) {
    return (
      <div className="mb-3 space-y-2.5">
        <div className="ui-field">
          <p className="ui-field-label">Remote storage</p>
          <p className="ui-field-value">Dropbox</p>
        </div>
        <AlertWithDescription
          title="Dropbox is not connected on this device"
          description="Connect Dropbox from the storage page to sync this project. Until then, changes are saved on this device only."
          type={Type.warning}
        />
        <Button
          id="goToRemotes"
          label="Storage and sync"
          iconLeft="logoDropbox"
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
            Dropbox{' '}
            <span className="font-normal text-sm text-[#5b6b80]">{dropboxAccountLabel(account)}</span>
          </p>
        </div>
        <div className="ui-field">
          <p className="ui-field-label">File</p>
          <p className="ui-field-value">{link?.path ?? (status?.isSyncing ? 'Saving…' : 'Not saved in Dropbox yet')}</p>
        </div>
      </div>

      <div className="ui-field flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="ui-field-label">Last sync</p>
          <p className="ui-field-value">
            {status?.isSyncing ? 'Syncing…' : ((status?.lastSync ?? lastSync) ? formatDate((status?.lastSync ?? lastSync)!) : 'Not synced yet')}
            {!status?.isSyncing && status?.pendingChanges && ' · some changes are not synced yet'}
          </p>
        </div>
        {!account.needsReauth && (
          <Button
            id="syncProjectNow"
            label={status?.isSyncing ? 'Syncing' : 'Sync now'}
            iconLeft="sync"
            iconLeftClassName={status?.isSyncing ? 'animate-spin' : ''}
            type={Type.secondary}
            size="sm"
            disabled={status?.isSyncing}
            onClick={() => (link ? DropboxSync.syncProject(project.id) : DropboxSync.syncAccount())}
          />
        )}
      </div>

      {account.needsReauth && (
        <div className="mb-2">
          <AlertWithDescription
            title="Log in to Dropbox again"
            description="Your session has expired. Changes are kept on this device and will be synced once you log in."
            type={Type.warning}
          />
          <Button
            id="reconnectFromProject"
            label="Log in again"
            iconLeft="logInOutline"
            type={Type.primary}
            onClick={reconnectDropbox}
            marginClassName="mt-2"
          />
        </div>
      )}
      {!account.needsReauth && status?.error && (
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
