import { Checkbox } from 'app/components/shared-components/common-ui-eles/checkbox.component'
import { Manager } from 'app/cross-refs-exports'
import type { FC } from 'react'
import type { ISectionElement } from 'app/models/section-element/section-element.declarations'

interface ICheckBoxAsCheckProps {
  sectionId: string
  element: ISectionElement
  label?: string
  fieldName: string
}

export const CheckBoxEditable: FC<ICheckBoxAsCheckProps> = (props) => {
  const handleOnChange = (value: boolean) => {
    Manager.getCurrentProject()
      ?.getSectionById(props.sectionId)
      ?.saveElement({ ...props.element, [props.fieldName]: value })
  }
  return (
    <Checkbox
      label={props.label}
      initialValue={!!props.element[props.fieldName]}
      isCentered={true}
      onChange={handleOnChange}
    />
  )
}
