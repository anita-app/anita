import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { SupportedViews } from 'app/models/section/view-settings.const'
import React from 'react'

interface IListTabsHeaderRightEditViewProps {
  activeTab: SupportedViews
}

export const ListTabsHeaderRightEditView: React.FC<IListTabsHeaderRightEditViewProps> = (props: IListTabsHeaderRightEditViewProps) => {
  const handleOpenConfigForView = () => {
    console.log('handleOpenConfigForView', props.activeTab)
  }
  return (
    <>
      <Button
        id="editView"
        label="Edit view"
        labelClassName="hidden"
        onClick={handleOpenConfigForView}
        iconLeft="cogOutline"
        tooltip='Edit view'
        type={Type.transparent}
        size="sm"
      />
    </>
  )
}
