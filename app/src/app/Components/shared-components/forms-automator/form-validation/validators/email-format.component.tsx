import { SUPPORTED_VALIDATORS } from 'app/Components/shared-components/forms-automator/form-validation/supported-validators.enum'
import { IValidatorsProps } from 'app/Components/shared-components/forms-automator/form-validation/validators'
import React, { memo, useEffect } from 'react'

export const EmailFormat: React.FC<IValidatorsProps> = memo(function EmailFormat ({ formEle, element, updateValidatorState }: IValidatorsProps) {
  const value = element[formEle.fieldName]
  // eslint-disable-next-line no-useless-escape
  const isValidEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)

  useEffect(() => {
    updateValidatorState(SUPPORTED_VALIDATORS.emailFormat, isValidEmail)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  if (isValidEmail || !value) {
    return null
  }

  return (<div className="ml-1 text-red-600 text-xs italic  d-block-inline">Invalid Email</div>)
}, (prevProps, nextProps) => prevProps.element[prevProps.formEle.fieldName] === nextProps.element[nextProps.formEle.fieldName] &&
    prevProps.touched === nextProps.touched)
