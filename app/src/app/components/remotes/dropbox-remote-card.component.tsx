import { useAtomValue } from 'jotai'
import dateFormat from 'date-format'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { CardFooter } from 'app/components/shared-components/common-ui-eles/card-footer.component'
import { AlertWithDescription } from 'app/components/shared-components/alerts/alert-with-description'
import { DropboxIcon, dropboxAccountLabel } from 'app/components/remotes/dropbox-icon.component'
import { OpenFromDropboxButton } from 'app/components/remotes/open-from-dropbox-button.component'
import { DropboxHelper } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'
import { DropboxSync } from 'app/libs/cloud-sync/dropbox/dropbox-sync.class'
import { getDropboxErrorMessage } from 'app/libs/cloud-sync/dropbox/dropbox-error.class'
import { DROPBOX_PROJECTS_FOLDER, DROPBOX_REMOTE_ID } from 'app/libs/cloud-sync/dropbox/dropbox.const'
import { ModalState } from 'app/state/modal/modal-state.class'
import { ProjectsListAtoms } from 'app/state/projects-list/projects-list.atoms'
import { SyncStateAtoms } from 'app/state/sync/sync-state.atoms'
import type { CSSProperties, FC } from 'react'
import type { IDropboxAccountState } from 'app/libs/cloud-sync/dropbox/dropbox.const'

/**
 * Opens the Dropbox login again, to renew the session. Shows what went wrong if it cannot.
 * @featurePart security.sync-sessions
 */
export const reconnectDropbox = async (): Promise<void> => {
  try {
    await DropboxHelper.instance.startLogin()
  } catch (error) {
    ModalState.showModal({
      title: 'Cannot open Dropbox',
      hideCancelButton: true,
      children: <p className="text-sm text-gray-600">{getDropboxErrorMessage(error)}</p>,
      ctas: [{ actionText: 'OK' }],
    })
  }
}

/**
 * The Dropbox account connected on this device, with its status and actions.
 * @featurePart sync.dropbox-connect, sync.status
 */
export const DropboxRemoteCard: FC<{ account: IDropboxAccountState; index?: number }> = (props) => {
  const account = props.account
  const status = useAtomValue(SyncStateAtoms.remotesStatus)[DROPBOX_REMOTE_ID]
  const projects = useAtomValue(ProjectsListAtoms.projects).filter(project => DropboxSync.isDropboxProject(project))

  const handleDisconnect = () => {
    ModalState.showModal({
      title: 'Disconnect Dropbox?',
      type: Type.danger,
      children: (
        <div className="text-sm text-gray-600">
          <p>This device will stop syncing with Dropbox. Nothing is deleted in your Dropbox.</p>
          {projects.length > 0 && (
            <p className="mt-2">
              {projects.length === 1 ? 'One project synced with Dropbox is' : `${projects.length} projects synced with Dropbox are`} on this device. You can keep {projects.length === 1 ? 'it' : 'them'} as local {projects.length === 1 ? 'project' : 'projects'}, or delete {projects.length === 1 ? 'it' : 'them'} from this device.
            </p>
          )}
        </div>
      ),
      ctas: projects.length > 0
        ? [
            { actionText: 'Keep projects', actionType: Type.secondary, handleClickAction: () => DropboxSync.disconnect({ deleteLocalProjects: false }) },
            { actionText: 'Delete from this device', handleClickAction: () => DropboxSync.disconnect({ deleteLocalProjects: true }) },
          ]
        : [{ actionText: 'Disconnect', handleClickAction: () => DropboxSync.disconnect({ deleteLocalProjects: false }) }],
    })
  }

  return (
    <div
      className="ui-card ui-pcard ui-rise"
      style={{ '--d': props.index ?? 0 } as CSSProperties}
    >
      <div className="p-5 md:p-6">
        <div className="flex items-center gap-4">
          <DropboxIcon sizeClassName="w-11 h-11" />
          <div className="min-w-0 grow">
            <h2 className="ui-title text-lg truncate">Dropbox</h2>
            <p className="text-sm text-[#5b6b80]">New projects are saved in the {DROPBOX_PROJECTS_FOLDER} folder, unless you choose another one. Projects of the {DROPBOX_PROJECTS_FOLDER} folder are downloaded automatically; open the others with &quot;Open from Dropbox&quot;.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4">
          <div className="ui-field">
            <p className="ui-field-label">Logged in as</p>
            <p className="ui-field-value">{dropboxAccountLabel(account)}</p>
            {account.accountName && account.email && <p className="text-xs text-[#7a8799] mt-0.5 truncate">{account.email}</p>}
          </div>
          <div className="ui-field">
            <p className="ui-field-label">Projects on this device</p>
            <p className="ui-field-value">{projects.length}</p>
          </div>
          <div className="ui-field">
            <p className="ui-field-label">Status</p>
            <p className="ui-field-value flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full shrink-0 ${account.needsReauth || status?.error ? 'bg-orange-500' : status?.isSyncing ? 'bg-[#2d96ff] animate-pulse' : 'bg-emerald-500'}`} />
              {account.needsReauth && 'Login required'}
              {!account.needsReauth && status?.isSyncing && 'Syncing…'}
              {!account.needsReauth && !status?.isSyncing && status?.lastSync && `Synced on ${dateFormat('yyyy/MM/dd, at hh:mm', new Date(status.lastSync))}`}
              {!account.needsReauth && !status?.isSyncing && !status?.lastSync && 'Connected'}
            </p>
          </div>
        </div>

        {(account.needsReauth || status?.error) && (
          <div className="mt-3">
            <AlertWithDescription
              title={account.needsReauth ? 'Log in again to resume syncing' : 'Last sync failed'}
              description={status?.error ?? 'Your Dropbox session has expired. Your changes are kept on this device.'}
              type={Type.warning}
            />
          </div>
        )}

        <CardFooter className="mt-5! pt-4 border-t border-[#eef1f5] items-center!">
          <Button
            id="disconnect-dropbox"
            label="Disconnect"
            iconLeft="trashOutline"
            type={Type.danger}
            fill="outline"
            onClick={handleDisconnect}
          />
          <div className="flex items-end ml-auto">
            <OpenFromDropboxButton
              size="md"
              breakpoint="md"
            />
            {account.needsReauth
              ? (
                <Button
                  id="reconnect-dropbox"
                  label="Log in again"
                  iconLeft="logInOutline"
                  type={Type.primary}
                  onClick={reconnectDropbox}
                  marginClassName=""
                />)
              : (
                <Button
                  id="sync-dropbox"
                  label={status?.isSyncing ? 'Syncing' : 'Sync now'}
                  iconLeft="sync"
                  iconLeftClassName={status?.isSyncing ? 'animate-spin' : ''}
                  type={Type.secondary}
                  disabled={status?.isSyncing}
                  onClick={() => DropboxSync.syncAccount()}
                  marginClassName=""
                />)}
          </div>
        </CardFooter>
      </div>
    </div>
  )
}
