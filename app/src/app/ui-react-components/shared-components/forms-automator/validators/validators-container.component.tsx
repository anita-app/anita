import { RequiredField } from 'app/ui-react-components/shared-components/forms-automator/validators/required-field.component';
import { IValidatorsConatinerProps } from 'app/ui-react-components/shared-components/forms-automator/validators/validators';

export const ValidatorsContainer = (props: IValidatorsConatinerProps) => {

  const validators = [];

  if (props.formEle.required)
    validators.push(<RequiredField key="required-validator" {...props} />)

  return (
    <span>
      {validators}
    </span>
  );
}