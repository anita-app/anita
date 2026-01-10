import { SUPPORTED_VALIDATORS } from 'app/components/shared-components/forms-automator/form-validation/supported-validators.enum'
import { memo, useEffect } from 'react'
import type { FC } from 'react'
import type { IValidatorsProps } from 'app/components/shared-components/forms-automator/form-validation/validators'

export const TelephoneNumber: FC<IValidatorsProps> = memo(function TelephoneNumber ({ formEle, element, updateValidatorState }: IValidatorsProps) {
  const value = element[formEle.fieldName]
  const isValidTelephonenumber = /^\+?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4,})$/.test(value)

  useEffect(() => {
    updateValidatorState(SUPPORTED_VALIDATORS.telephoneNumber, isValidTelephonenumber)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  if (isValidTelephonenumber || !value) {
    return null
  }

  return (<div className="ml-1 text-red-600 text-xs italic  d-block-inline">Invalid telephone number</div>)
}, (prevProps, nextProps) => prevProps.element[prevProps.formEle.fieldName] === nextProps.element[nextProps.formEle.fieldName] &&
    prevProps.touched === nextProps.touched)
