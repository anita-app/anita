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
      label="Save on Dropbox"
      breakpoint="md"
      tooltip="Save the project on Dropbox to sync it with other devices"
      type={Type.transparent}
      iconLeft="cloudyOutline"
      onClick={handleOpenModalClick}
    />
  )
}
