import { useState, type FC } from 'react'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { DropboxPicker } from 'app/components/remotes/dropbox-picker.component'
import { useDropboxIsWritable } from 'app/components/remotes/dropbox-icon.component'
import { DropboxSync } from 'app/libs/cloud-sync/dropbox/dropbox-sync.class'
import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { RoutingState } from 'app/state/routing/routing-state.class'
import type { IDropboxPickedFile } from 'app/components/remotes/dropbox-picker.component'

interface IOpenFromDropboxButtonProps {
  size?: 'sm' | 'md'
  type?: Type
  /** Shows only the icon below this breakpoint. */
  breakpoint?: 'sm' | 'md' | 'lg'
  marginClassName?: string
}

/**
 * Opens a project file saved anywhere in Dropbox: the project is added to this device and kept in sync with that file.
 * Shown only when Dropbox is connected.
 *
 * @feature sync.dropbox-open-file
 * @title Open a project from Dropbox
 * @summary Opens a project file saved anywhere in your Dropbox: the project is added to this device and kept in sync with that file.
 * @where Button "Open from Dropbox" in the list of projects, on the page shown when there are no projects, and on the Dropbox card of Storage and sync. Shown only when Dropbox is connected and logged in.
 * @usage 1. Click "Open from Dropbox". 2. In "Open a project from Dropbox" browse the folders (the breadcrumb goes back up). 3. Select the .json file of an Anita project and click "Open project" (or double-click it). 4. The project opens and is synced with that file from then on.
 * @options none
 * @rules Only .json files can be selected. If the project is already on this device and not synced, the two copies are merged keeping the records of both. Messages: "<file> is not an Anita project.", "This project is already on this device, synced with <path>.", "This project is already on this device, synced with a WordPress site." Errors are shown in the picker under "The project could not be opened".
 * @errors dropbox.invalidFile, dropbox.notFound, dropbox.network
 * @status beta
 * @since 1.0.0
 * @related sync.dropbox-projects
 */
export const OpenFromDropboxButton: FC<IOpenFromDropboxButtonProps> = (props) => {
  const isWritable = useDropboxIsWritable()
  const [isOpen, setIsOpen] = useState(false)

  if (!isWritable) {
    return null
  }

  const handlePick = async (file: IDropboxPickedFile) => {
    const projectId = await DropboxSync.importFromFile(file.fileId)
    setIsOpen(false)
    RoutingState.goTo(ANITA_URLS.projectDetails, [{ name: URL_PARAMS.projectId, value: projectId }])
  }

  return (
    <>
      <Button
        id="openFromDropbox"
        label="Open from Dropbox"
        iconLeft="logoDropbox"
        tooltip="Open a project file saved anywhere in your Dropbox"
        type={props.type ?? Type.secondary}
        size={props.size ?? 'sm'}
        breakpoint={props.breakpoint}
        marginClassName={props.marginClassName}
        onClick={() => setIsOpen(true)}
      />
      <DropboxPicker
        open={isOpen}
        mode="file"
        onClose={() => setIsOpen(false)}
        onPickFile={handlePick}
      />
    </>
  )
}
