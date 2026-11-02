import { EmailFormat } from 'app/components/shared-components/forms-automator/form-validation/validators/email-format.component'
import { RequiredField } from 'app/components/shared-components/forms-automator/form-validation/validators/required-field.component'
import { TelephoneNumber } from 'app/components/shared-components/forms-automator/form-validation/validators/telephone-number.component'
import { UrlFormat } from 'app/components/shared-components/forms-automator/form-validation/validators/url-format.component'
import { TextInputSupportedTypes } from 'app/components/shared-components/forms-automator/input-supported-types.const'
import { memo, useEffect, useState } from 'react'
import type { FC } from 'react'
import type { IValidatorsConatinerProps, IValidatorsState } from 'app/components/shared-components/forms-automator/form-validation/validators'
import type { SUPPORTED_VALIDATORS } from 'app/components/shared-components/forms-automator/form-validation/supported-validators.enum'

/**
 * @feature field.format-validation
 * @title Check of e-mail, phone and web addresses
 * @summary Short text fields with Content type Email, Tel or Url check the format of the value and prevent saving until it is correct.
 * @where Form to add or edit a record: a red message under the field.
 * @usage Give a Short text field the Content type Email, Tel or Url. When filling in a record, a red message appears under the field while the value has a wrong format and disappears when it is correct.
 * @options none: the check depends on the Content type of the field.
 * @rules Messages: "Invalid Email" (an address like name@example.com is expected); "Invalid telephone number" (at least ten digits grouped 3-3-4, optionally with a + in front and spaces, dots, dashes or brackets between the groups, e.g. 555 123 4567: numbers with a country code such as +39 in front are not accepted); "Invalid address (it must start with http:// or https://)" (a web address with a domain such as example.com; addresses of a local network such as 192.168.1.1 are not accepted). An empty value passes the check, unless the field is required. While a value is wrong the save buttons are disabled and the form says "To save, correct the fields marked in red.".
 * @errors none
 * @status stable
 * @since 0.12.0
 * @covers validator:emailFormat, validator:telephoneNumber, validator:urlFormat
 * @related field.short-text, field.required
 */
export const ValidatorsContainer: FC<IValidatorsConatinerProps> = memo(function ValidatorsContainer (props: IValidatorsConatinerProps) {
  const validators = []
  const [fieldValidatorsState, setFieldValidatorsState] = useState<IValidatorsState>({})

  const updateValidatorState = (validatorName: SUPPORTED_VALIDATORS, isValid: boolean) => {
    setFieldValidatorsState(currentValue => {
      if (currentValue[validatorName] && currentValue[validatorName] === isValid) {
        return currentValue
      }
      const newValue: IValidatorsState = { ...currentValue, [validatorName]: isValid }
      return newValue
    })
  }

  useEffect(() => {
    const allValid = Object.keys(fieldValidatorsState).every(key => fieldValidatorsState[key as unknown as keyof IValidatorsState])
    props.setIsValidForField(allValid)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldValidatorsState])

  if (props.formEle.required) {
    validators.push(<RequiredField
      key="required-validator"
      updateValidatorState={updateValidatorState}
      {...props}
                    />)
  }

  if (props.formEle?.type === TextInputSupportedTypes.email) {
    validators.push(<EmailFormat
      key="email-validator"
      updateValidatorState={updateValidatorState}
      {...props}
                    />)
  }

  if (props.formEle?.type === TextInputSupportedTypes.tel) {
    validators.push(<TelephoneNumber
      key="telephone-validator"
      updateValidatorState={updateValidatorState}
      {...props}
                    />)
  }

  if (props.formEle?.type === TextInputSupportedTypes.url) {
    validators.push(<UrlFormat
      key="url-validator"
      updateValidatorState={updateValidatorState}
      {...props}
                    />)
  }

  return (
    <div className="flex">
      {validators}
    </div>
  )
}, (prevProps, nextProps) => prevProps.element[prevProps.formEle.fieldName] === nextProps.element[nextProps.formEle.fieldName] &&
    prevProps.touched === nextProps.touched)
