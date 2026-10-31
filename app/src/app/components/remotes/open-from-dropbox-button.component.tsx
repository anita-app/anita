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
