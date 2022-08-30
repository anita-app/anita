import { ISection } from 'app/data/project-structure/project-info'
import { FieldSelector } from 'app/Components/shared-components/forms-automator/form-layout/field-selector.component'
import React from 'react'

export interface IFormAutomatorProps {
  formModel: ISection['formModel'];
  element: { [key: string]: any };
  handleChange: (...args: any) => void;
  [customProps: string]: any;

}

export const FormAutomator: React.FC<IFormAutomatorProps> = (props) => (
    <span>
      {props.formModel.map((formEle, index) => (
        <FieldSelector key={formEle.fieldName + index.toString()} formEle={formEle} {...props} />
      ))}
    </span>
)
