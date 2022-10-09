import { ListTabsHeaderRightEditView } from 'app/components/project/section/list/tabs/header-right-edit-view.component'
import { ListTabsHeaderRightViewSelector } from 'app/components/project/section/list/tabs/header-right-view-selector.component'
import { SupportedViews } from 'app/models/section/view-settings.const'
import React, { memo } from 'react'

export interface IListTabsHeaderRightProps {
  sectionId: string
  activeTab: SupportedViews
}

export const ListTabsHeaderRight: React.FC<IListTabsHeaderRightProps> = memo(function IListTabsHeaderRightProps (props: IListTabsHeaderRightProps) {
  return (
    <div className="flex justify-end">
      <ListTabsHeaderRightEditView activeTab={props.activeTab} sectionId={props.sectionId} />
      <ListTabsHeaderRightViewSelector activeTab={props.activeTab} />
    </div>
  )
})
