import { SUPPORTED_VALIDATORS } from 'app/ui-react-components/shared-components/forms-automator/form-validation/supported-validators.enum'
import { IValidatorsProps } from 'app/ui-react-components/shared-components/forms-automator/form-validation/validators'
import { memo, useEffect } from 'react'

export const UrlFormat = memo(function TelephoneNumber({ formEle, element, updateValidatorState }: IValidatorsProps) {

  const value = element[formEle.fieldName];
  // see https://stackoverflow.com/questions/8667070/javascript-regular-expression-to-validate-url
  const isValidUrl = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);

  useEffect(() => {
    updateValidatorState(SUPPORTED_VALIDATORS.urlFormat, isValidUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (isValidUrl || !value)
    return null

  return (<div className="ml-1 text-red-600 text-xs italic  d-block-inline">Invalid address. Should start with 'http://' or 'https://'</div>);

}, (prevProps, nextProps) => {
  return prevProps.element[prevProps.formEle.fieldName] === nextProps.element[nextProps.formEle.fieldName]
    && prevProps.touched === nextProps.touched
});
