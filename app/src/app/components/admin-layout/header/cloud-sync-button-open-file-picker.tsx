import React from 'react'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { useModalContext } from 'app/components/shared-components/modals/modal-context'
import { FILE_PICKER_MODAL_CONFIG } from 'app/components/admin-layout/header/cloud-sync-file-picker'

export const CloudSyncButtonOpenFilePicker: React.FC = () => {
  const { showModal } = useModalContext()
  const handleOpenModalClick = async () => {
    showModal(FILE_PICKER_MODAL_CONFIG)
  }
  return (
    <Button
      id="cloud-sync-button"
      label="Connect with Dropbox"
      tooltip="Pick the file you want to sync with Dropbox"
      type={Type.transparent}
      iconLeft="cloudyOutline"
      onClick={handleOpenModalClick}
    />
  )
}
