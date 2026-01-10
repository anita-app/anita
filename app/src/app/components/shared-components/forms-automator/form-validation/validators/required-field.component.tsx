import { SUPPORTED_VALIDATORS } from 'app/components/shared-components/forms-automator/form-validation/supported-validators.enum'
import { memo, useEffect } from 'react'
import type { FC } from 'react'
import type { IValidatorsProps } from 'app/components/shared-components/forms-automator/form-validation/validators'

export const RequiredField: FC<IValidatorsProps> = memo(function RequiredField ({ formEle, element, touched, updateValidatorState }: IValidatorsProps) {
  const value = element[formEle.fieldName]

  useEffect(() => {
    updateValidatorState(SUPPORTED_VALIDATORS.required, value !== '' && value !== undefined && value !== null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  if (value || !touched) {
    return (<div className="ml-1 text-xs italic text-gray-400 d-block-inline">Required</div>)
  }

  return (<div className="ml-1 text-red-600 text-xs italic">This field is required</div>)
}, (prevProps, nextProps) => prevProps.element[prevProps.formEle.fieldName] === nextProps.element[nextProps.formEle.fieldName] &&
    prevProps.touched === nextProps.touched)
