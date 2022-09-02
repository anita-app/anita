import { SUPPORTED_VALIDATORS } from 'app/components/shared-components/forms-automator/form-validation/supported-validators.enum'
import { IValidatorsConatinerProps, IValidatorsState } from 'app/components/shared-components/forms-automator/form-validation/validators'
import { EmailFormat } from 'app/components/shared-components/forms-automator/form-validation/validators/email-format.component'
import { RequiredField } from 'app/components/shared-components/forms-automator/form-validation/validators/required-field.component'
import { TelephoneNumber } from 'app/components/shared-components/forms-automator/form-validation/validators/telephone-number.component'
import { UrlFormat } from 'app/components/shared-components/forms-automator/form-validation/validators/url-format.component'
import { TextInputSupportedTypes } from 'app/components/shared-components/forms-automator/input-supported-types.const'
import React, { memo, useState } from 'react'

export const ValidatorsContainer: React.FC<IValidatorsConatinerProps> = memo(function ValidatorsContainer (props: IValidatorsConatinerProps) {
  const validators = []
  const setFieldValidatorsState = useState<IValidatorsState>({})[1]

  const updateValidatorState = (validatorName: SUPPORTED_VALIDATORS, isValid: boolean) => {
    setFieldValidatorsState(currentValue => {
      if (currentValue[validatorName] === isValid) {
        return currentValue
      }

      const newValue: IValidatorsState = { ...currentValue, [validatorName]: isValid }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const allValid = Object.keys(newValue).every(key => newValue[key as unknown as keyof IValidatorsState])
      props.setIsValidForField(allValid)
      return newValue
    })
  }

  if (props.formEle.required) {
    validators.push(<RequiredField key="required-validator" updateValidatorState={updateValidatorState} {...props} />)
  }

  if (props.formEle?.type === TextInputSupportedTypes.email) {
    validators.push(<EmailFormat key="email-validator" updateValidatorState={updateValidatorState} {...props} />)
  }

  if (props.formEle?.type === TextInputSupportedTypes.tel) {
    validators.push(<TelephoneNumber key="telephone-validator" updateValidatorState={updateValidatorState} {...props} />)
  }

  if (props.formEle?.type === TextInputSupportedTypes.url) {
    validators.push(<UrlFormat key="url-validator" updateValidatorState={updateValidatorState} {...props} />)
  }

  return (
    <div className="flex">
      {validators}
    </div>
  )
}, (prevProps, nextProps) => prevProps.element[prevProps.formEle.fieldName] === nextProps.element[nextProps.formEle.fieldName] &&
    prevProps.touched === nextProps.touched)
