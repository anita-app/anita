import { Toggle } from 'app/components/shared-components/common-ui-eles/toggle.component'
import { Manager } from 'app/libs/manager/manager.class'
import React from 'react'

interface IListTabsHeaderRightEditViewListProps {
  sectionId: string
}

export const ListTabsHeaderRightEditViewTable: React.FC<IListTabsHeaderRightEditViewListProps> = (props) => {
  const section = Manager.getCurrentProject()?.getSectionById(props.sectionId)!
  const handleChangeForSection = (formEleFieldName: string, value: boolean) => {
    section.setIsFormEleVisibleInTable(formEleFieldName, value)
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
    </div>
  )
}
