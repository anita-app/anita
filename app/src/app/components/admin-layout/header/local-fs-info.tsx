import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import React from 'react'

export const LocalFsInfo: React.FC = () => {
  console.log('LocalFsInfo')
  return (
    <Button
      id="local-fs-info"
      type={Type.transparent}
      iconLeft="desktopOutline"
      label="Saved on Disk"
      onClick={() => { }}
      className="cursor-default"
    />
  )
}
