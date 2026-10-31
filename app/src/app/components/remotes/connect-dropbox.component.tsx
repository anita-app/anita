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
