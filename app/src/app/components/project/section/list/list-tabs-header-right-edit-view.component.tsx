import { ListTabsHeaderRightEditViewTable } from 'app/components/project/section/list/list-tabs-header-right-edit-view-table.component'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { useModalContext } from 'app/components/shared-components/modals/modal-context'
import { IModalProps } from 'app/components/shared-components/modals/modal.component'
import { SupportedViews } from 'app/models/section/view-settings.const'
import React from 'react'

interface IListTabsHeaderRightEditViewProps {
  sectionId: string
  activeTab: SupportedViews
}

export const ListTabsHeaderRightEditView: React.FC<IListTabsHeaderRightEditViewProps> = (props: IListTabsHeaderRightEditViewProps) => {
  const modalConfigsByView: { [key: number]: IModalProps } = {
    [SupportedViews.grid]: {
      title: 'Edit Card Layout',
      actionText: 'Close',
      hideCancelButton: true,
      type: Type.primary,
      children: <>ToDo</>
    },
    [SupportedViews.table]: {
      title: 'Edit visible columns',
      actionText: 'Close',
      hideCancelButton: true,
      type: Type.primary,
      children: <><ListTabsHeaderRightEditViewTable sectionId={props.sectionId} /></>
    }
  }
  const { showModal } = useModalContext()
  const handleOpenConfigForView = () => {
    showModal(modalConfigsByView[props.activeTab])
  }
  return (
    <>
      <Button
        id="editView"
        label="Edit view"
        labelClassName="hidden"
        onClick={handleOpenConfigForView}
        iconLeft="cogOutline"
        tooltip="Edit view"
        type={Type.transparent}
        size="sm"
      />
    </>
  )
}
