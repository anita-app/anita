import { ISection } from 'app/models/section-n/section.declarations'
import { FieldSelector } from 'app/components/shared-components/forms-automator/form-layout/field-selector.component'
import React from 'react'

export interface IFormAutomatorProps {
  formModel: ISection['formModel']
  element: { [key: string]: any }
  handleChange: (...args: any) => void
  [customProps: string]: any

}

export const FormAutomator: React.FC<IFormAutomatorProps> = (props) => (
  <span>
    {props.formModel.map((formEle, index) => (
      <FieldSelector key={formEle.fieldName + index.toString()} formEle={formEle} {...props} />
    ))}
  </span>
)
