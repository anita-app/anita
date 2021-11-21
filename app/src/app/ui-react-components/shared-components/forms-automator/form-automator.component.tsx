import { Section } from 'app/data/model/project-info';
import { ICommonFormEleProps } from 'app/ui-react-components/shared-components/forms-automator/form-fields/form-fields-model';
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
      {props.formModel.map((formEle) => {
        const propsForFormElesSwitcher: ICommonFormEleProps = { formEle, ...props };
        return <FieldSelector key={formEle.fieldName} {...propsForFormElesSwitcher} />;
      })}
    </span>
  )

}