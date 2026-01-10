import { FieldSelector } from 'app/components/shared-components/forms-automator/form-layout/field-selector.component'
import type { FC } from 'react'
import type { ISection } from 'app/models/section/section.declarations'

export interface IFormAutomatorProps {
  formModel: ISection['formModel']
  element: { [key: string]: any }
  handleChange: (...args: any) => void
  [customProps: string]: any

}

export const FormAutomator: FC<IFormAutomatorProps> = (props) => (
  <span>
    {props.formModel.map((formEle, index) => (
      <FieldSelector
        key={formEle.fieldName + index.toString()}
        formEle={formEle}
        {...props}
      />
    ))}
  </span>
)
