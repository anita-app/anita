import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { Toggle } from 'app/components/shared-components/common-ui-eles/toggle.component'
import { useModalContext } from 'app/components/shared-components/modals/modal-context'
import { Manager } from 'app/libs/manager/manager.class'
import React from 'react'
import { storeDispatcher } from 'app/libs/redux/store-dispatcher.function'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { ListTabsHeaderRightAddField } from 'app/components/project/section/list/tabs/header-right-add-field.component'
import type { IModalProps } from 'app/components/shared-components/modals/modal.component'

interface IListTabsHeaderRightEditViewListProps {
  sectionId: string
}

export const ListTabsHeaderRightEditViewTable: React.FC<IListTabsHeaderRightEditViewListProps> = (props) => {
  const section = Manager.getCurrentProject()?.getSectionById(props.sectionId)!
  const { showModal } = useModalContext()
  const handleChangeForSection = (formEleFieldName: string, value: boolean) => {
    section.setIsFormEleVisibleInTable(formEleFieldName, value)
  }
  const handleOnAddFieldClick = () => {
    const project = Manager.getCurrentProject()
    const payload = project?.getSystemData()
    const sectionIndex = payload?._sections?.findIndex((sez) => sez.id === section.id)
    if (payload && sectionIndex !== undefined) {
      storeDispatcher({ type: REDUX_ACTIONS.setFormProject, payload })
      storeDispatcher({ type: REDUX_ACTIONS.updateFormProjectAddFieldToSection, payload: sectionIndex })
    }
    showModal({
      title: 'Add field',
      actionText: 'Add',
      type: Type.primary,
      hideActionRow: true,
      children: <><ListTabsHeaderRightAddField sectionId={section.id} /></>
    } as IModalProps)
  }
  return (
    <div className="mt-6">
      {section.formModel.map((formEle) => (
        <div key={formEle.fieldName}>
          <Toggle
            label={formEle.label!}
            initialState={section.getIsFormEleVisibleInTable(formEle.fieldName)}
            onChange={(value) => handleChangeForSection(formEle.fieldName, value)}
          />
        </div>
      ))}
      <Button
        id="addField"
        label="Add field"
        onClick={handleOnAddFieldClick}
        type={Type.transparent}
        size="sm"
        iconLeft="add"
        className="mt-1"
      />
    </div>
  )
}
