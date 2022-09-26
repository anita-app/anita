import { Checkbox } from 'app/components/shared-components/common-ui-eles/checkbox.component'
import { Manager } from 'app/libs/manager/manager.class'
import React from 'react'

interface ICheckBoxAsCheckProps {
  sectionId: string
  elementId: string
  label?: string
  fieldName: string
  value: boolean
}

export const CheckBoxEditable: React.FC<ICheckBoxAsCheckProps> = (props) => {
  const handleOnChange = (value: boolean) => {
    Manager.getCurrentProject()
      ?.getSectionById(props.sectionId)
      ?.saveElement({ id: props.elementId, [props.fieldName]: value })
  }
  return (
    <Checkbox
      label={props.label}
      initialValue={props.value}
      onChange={handleOnChange}
    />
  )
}
