import { IValidatorsProps } from 'app/ui-react-components/shared-components/forms-automator/validators/validators'
import { memo, useEffect } from 'react'

export const RequiredField = memo(function RequiredField({ formEle, element, touched, updateValidatorState }: IValidatorsProps) {

  const value = element[formEle.fieldName];

  useEffect(() => {
    updateValidatorState('required', value !== '' && value !== undefined && value !== null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (value || !touched)
    return (<div className="ml-1 text-xs italic text-gray-400">Required</div>);

  return (<div className="ml-1 text-red-600 text-xs italic">This field is required</div>);

}, (prevProps, nextProps) => {
  return prevProps.element[prevProps.formEle.fieldName] === nextProps.element[nextProps.formEle.fieldName]
    && prevProps.touched === nextProps.touched
});
