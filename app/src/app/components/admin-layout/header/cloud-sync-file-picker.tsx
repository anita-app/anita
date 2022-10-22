import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { IModalProps } from 'app/components/shared-components/modals/modal.component'
import React from 'react'

const CloudSyncFilePicker: React.FC = () => (
  <div>
    not yet implemented
  </div>
)

export const FILE_PICKER_MODAL_CONFIG: IModalProps = {
  title: 'Pick a file or folder',
  actionText: 'Select',
  type: Type.primary,
  handleClickAction: () => {},
  children: (
    <><CloudSyncFilePicker /></>
  )
}
