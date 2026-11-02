import { useState, type FC } from 'react'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { AlertWithDescription } from 'app/components/shared-components/alerts/alert-with-description'
import { DropboxIcon } from 'app/components/remotes/dropbox-icon.component'
import { DropboxHelper } from 'app/libs/cloud-sync/dropbox/dropbox-helper.class'
import { getDropboxErrorMessage } from 'app/libs/cloud-sync/dropbox/dropbox-error.class'
import { DROPBOX_PROJECTS_FOLDER } from 'app/libs/cloud-sync/dropbox/dropbox.const'

/**
 * Explanation and button to connect Dropbox.
 *
 * @feature sync.dropbox-connect
 * @title Connect a Dropbox account
 * @summary Connects your Dropbox to Anita on this device, so that your projects are backed up and available on every device where you connect the same account.
 * @where On the "Storage and sync" page (button "Storage and sync" in the list of projects, or the Dropbox and WordPress icons in the header), section Dropbox, button "Connect". Also with "Connect Dropbox and save" / "Create and connect Dropbox" when Dropbox is chosen as storage of a project before connecting it.
 * @usage 1. Open Storage and sync. 2. In the Dropbox card click "Connect": Anita opens the Dropbox login in the same tab. 3. Log in and allow Anita to use your files: Dropbox brings you back to Anita, which shows "Dropbox connected". 4. Choose Dropbox as storage when you create a project, or in its settings ("Remote storage"). To remove the account, click "Disconnect" on the Dropbox card.
 * @options When disconnecting with projects of this device synced with Dropbox: "Keep projects" (they stay on this device as local projects) or "Delete from this device"; with no such projects, just "Disconnect". When logging in with a different Dropbox account: "Continue as <name>" or "Cancel".
 * @rules One Dropbox account per device; nothing to install. Once connected, the projects of the /Anita folder of the Dropbox are downloaded to this device. The card shows "Logged in as" (name and email), "Projects on this device" and "Status". Disconnecting never deletes anything in Dropbox. Logging in with another account asks "Switch Dropbox account?": the projects of the previous account stop syncing and stay on this device as local projects, so they are not copied to the new account. The login must be completed in the same browser within 30 minutes, otherwise "This connection was not started from this browser, or it took too long. Please connect Dropbox again from Anita." Cancelling on Dropbox shows "The connection was cancelled on Dropbox."; any failure shows "The connection did not complete" with the reason and a "Back to Storage and sync" button. If the login cannot be opened, the card shows "Dropbox cannot be connected" with the reason.
 * @errors dropbox.authFailed, dropbox.network, dropbox.unknown
 * @status beta
 * @since 0.18.0
 * @routes remotes, auth
 * @covers cloud:DROPBOX
 * @related sync.dropbox-projects, security.sync-sessions, storage.choice
 */
export const ConnectDropbox: FC = () => {
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    setError(null)
    setIsStarting(true)
    try {
      // Leaves the app: Dropbox sends the user back when the login is complete.
      await DropboxHelper.instance.startLogin()
    } catch (connectError) {
      setError(getDropboxErrorMessage(connectError))
      setIsStarting(false)
    }
  }

  return (
    <div className="p-5 md:p-6">
      <div className="flex items-start gap-4">
        <DropboxIcon sizeClassName="w-11 h-11" />
        <div className="min-w-0">
          <h2 className="ui-title text-lg">Connect Dropbox</h2>
          <p className="text-sm text-[#5b6b80] mt-0.5">Keep your projects in your own Dropbox: backed up, and on every device where you connect the same account. Nothing to install.</p>
        </div>
      </div>

      <ol className="grid gap-2.5 sm:grid-cols-3 my-5">
        <li className="ui-field flex gap-3 text-sm text-[#33445a]">
          <span className="ui-step">1</span>
          <span>Click Connect and log in with your Dropbox account.</span>
        </li>
        <li className="ui-field flex gap-3 text-sm text-[#33445a]">
          <span className="ui-step">2</span>
          <span>Allow Anita to use your files: you will be brought back here.</span>
        </li>
        <li className="ui-field flex gap-3 text-sm text-[#33445a]">
          <span className="ui-step">3</span>
          <span>Choose Dropbox as storage when you create a project, or in its settings.</span>
        </li>
      </ol>

      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <p className="grow text-xs text-[#7a8799]">Projects are saved as files in the <strong className="font-semibold">{DROPBOX_PROJECTS_FOLDER}</strong> folder. The ones already there are downloaded to this device.</p>
        <Button
          id="connectDropbox"
          label={isStarting ? 'Opening Dropbox…' : 'Connect'}
          iconLeft="logoDropbox"
          type={Type.primary}
          onClick={handleConnect}
          disabled={isStarting}
          marginClassName=""
        />
      </div>

      {error && (
        <div className="mt-4">
          <AlertWithDescription
            title="Dropbox cannot be connected"
            description={error}
            type={Type.warning}
          />
        </div>
      )}
    </div>
  )
}
