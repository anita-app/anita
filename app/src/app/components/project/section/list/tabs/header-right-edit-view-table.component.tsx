import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { Toggle } from 'app/components/shared-components/common-ui-eles/toggle.component'
import { Manager } from 'app/cross-refs-exports'
import React from 'react'
import { ListTabsHeaderRightAddField } from 'app/components/project/section/list/tabs/header-right-add-field.component'
import { IModalProps, ModalState } from 'app/state/modal/modal-state.class'
import { FormProjectState } from 'app/state/form-project/form-project-state.class'

interface IListTabsHeaderRightEditViewListProps {
  sectionId: string
}

export const ListTabsHeaderRightEditViewTable: React.FC<IListTabsHeaderRightEditViewListProps> = (props) => {
  const section = Manager.getCurrentProject()?.getSectionById(props.sectionId)!
  const handleChangeForSection = (formEleFieldName: string, value: boolean) => {
    section.setIsFormEleVisibleInTable(formEleFieldName, value)
  }
  const handleOnAddFieldClick = () => {
    const project = Manager.getCurrentProject()
    const payload = project?.getSystemData()
    const sectionIndex = payload?._sections?.findIndex((sez) => sez.id === section.id)
    if (payload && sectionIndex !== undefined) {
      FormProjectState.setFormProject(payload)
      FormProjectState.addFieldToSection(sectionIndex)
    }
    ModalState.showModal({
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
