import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { IS_SAVING_IN_FS } from 'app/libs/cloud-sync/sync-manager.const'
import React, { useEffect } from 'react'

export const LocalFsInfo: React.FC = () => {
  const [isSavingInFs, setIsSavingInFs] = React.useState(false)

  useEffect(() => {
    const updateIsSaving = (newValue: boolean) => {
      setIsSavingInFs(newValue)
    }
    const isSavingSubscription = IS_SAVING_IN_FS.subscribe(updateIsSaving)
    return () => {
      isSavingSubscription.unsubscribe()
    }
  }, [])

  return (
    <Button
      id="local-fs-info"
      type={Type.transparent}
      iconLeft="desktopOutline"
      iconLeftClassName={isSavingInFs ? 'animate-pulse' : ''}
      label="Saved on Disk"
      onClick={() => { }}
      className="cursor-default"
    />
  )
}
