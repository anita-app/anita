import { checkIsValidValueForControlledReactForm } from 'app/libs/tools/check-is-valid-value-for-controlled-react-form.function';
import { ICommonFormEleProps } from 'app/ui-react-components/shared-components/forms-automator/form-fields/form-fields-model';

export const HiddenInput = ({ formEle, element, handleChange }: ICommonFormEleProps) => {

  return (<input key={formEle.fieldName}
    name={formEle.fieldName}
    type="hidden"
    value={checkIsValidValueForControlledReactForm(element, formEle.fieldName) ? '' : element[formEle.fieldName]}
    onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleChange(formEle.fieldName, event.target.value)} />)
};