import { IValidStateForEle } from 'app/libs/redux/action.type'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { storeDispatcher } from 'app/libs/redux/store-dispatcher.function'
import { RequiredField } from 'app/ui-react-components/shared-components/forms-automator/validators/required-field.component'
import { SUPPORTED_VALIDATORS } from 'app/ui-react-components/shared-components/forms-automator/validators/supported-validators.enum'
import { IValidatorsConatinerProps, IValidatorsState } from 'app/ui-react-components/shared-components/forms-automator/validators/validators'
import { memo, useState } from 'react'

export const ValidatorsContainer = memo(function ValidatorsContainer(props: IValidatorsConatinerProps) {

  const validators = [];
  const setFieldValidatorsState = useState<IValidatorsState>({})[1];

  const updateValidatorState = (validatorName: SUPPORTED_VALIDATORS, isValid: boolean) => {
    setFieldValidatorsState(currentValue => {
      if (currentValue[validatorName] === isValid)
        return currentValue;

      const newValue = { ...currentValue, [validatorName]: isValid };
      const allValid = Object.keys(newValue).every(key => newValue[key]);
      storeDispatcher({
        type: REDUX_ACTIONS.setValidStateForEle, payload: {
          formEleId: props.fieldId,
          valid: allValid
        } as IValidStateForEle
      });
      return newValue;
    });
  }

  if (props.formEle.required)
    validators.push(<RequiredField key="required-validator" updateValidatorState={updateValidatorState} {...props} />)

  return (
    <span>
      {validators}
    </span>
  );
}, (prevProps, nextProps) => {
  return prevProps.element[prevProps.formEle.fieldName] === nextProps.element[nextProps.formEle.fieldName]
    && prevProps.touched === nextProps.touched
});