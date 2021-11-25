import { Section } from 'app/data/model/project-info';
import { FieldSelector } from 'app/ui-react-components/shared-components/forms-automator/form-layout/field-selector.component';

export interface IFormAutomatorProps {
  formModel: Section['formModel'];
  element: { [key: string]: any };
  handleChange: (...args: any) => void;
  [customProps: string]: any;

}

export const FormAutomator = (props: IFormAutomatorProps) => {

  return (
    <span>
      {props.formModel.map((formEle) => (
        <FieldSelector key={formEle.fieldName} formEle={formEle} {...props} />
      ))}
    </span>
  )

}