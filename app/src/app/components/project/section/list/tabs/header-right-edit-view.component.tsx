import { ListTabsHeaderRightEditViewTable } from 'app/components/project/section/list/tabs/header-right-edit-view-table.component'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { SupportedViews } from 'app/models/section/view-settings.const'
import { ModalState } from 'app/state/modal/modal-state.class'
import type { FC } from 'react'
import type { IModalProps } from 'app/state/modal/modal-state.class'

interface IListTabsHeaderRightEditViewProps {
  sectionId: string
  activeTab: SupportedViews
}

export const ListTabsHeaderRightEditView: FC<IListTabsHeaderRightEditViewProps> = (props: IListTabsHeaderRightEditViewProps) => {
  const modalConfigsByView: { [key: number]: IModalProps } = {
    [SupportedViews.grid]: {
      title: 'Edit Card Layout',
      ctas: [{
        actionText: 'Close',
      }],
      hideCancelButton: true,
      type: Type.primary,
      children: <>ToDo</>,
    },
    [SupportedViews.table]: {
      title: 'Edit visible columns',
      ctas: [{
        actionText: 'Close',
      }],
      hideCancelButton: true,
      type: Type.primary,
      children: <><ListTabsHeaderRightEditViewTable sectionId={props.sectionId} /></>,
    },
  }
  const handleOpenConfigForView = () => {
    ModalState.showModal(modalConfigsByView[props.activeTab])
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
