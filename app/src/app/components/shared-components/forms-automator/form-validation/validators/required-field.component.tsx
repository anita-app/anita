import { SUPPORTED_VALIDATORS } from 'app/components/shared-components/forms-automator/form-validation/supported-validators.enum'
import { memo, useEffect } from 'react'
import type { FC } from 'react'
import type { IValidatorsProps } from 'app/components/shared-components/forms-automator/form-validation/validators'

/**
 * @feature field.required
 * @title Required fields
 * @summary Mark a field as required, so that a record cannot be saved while the field is empty.
 * @where Project editor: the "Required" check box of each field. Form to add or edit a record: an asterisk (*) after the label, a message under the field and a message next to the save buttons.
 * @usage In the project editor, tick "Required" on the field and save the project. When filling in a record, fill in the fields marked with an asterisk.
 * @options Required: off by default.
 * @rules After the field has been left empty, it turns red and shows "This field is required". While a required field is empty the save buttons are disabled, and next to them the form says "To save, fill in the required field: <label>." (or "the required fields:" followed by their labels); the save keyboard shortcut does nothing. Exceptions: on a Long text field the asterisk is shown but saving is not blocked; on a Check box, see the check box field. The first required Short text of type Text can name the records of the section.
 * @errors none
 * @status stable
 * @since 0.1.0
 * @covers validator:required
 * @related field.format-validation, record.title
 */
export const RequiredField: FC<IValidatorsProps> = memo(function RequiredField ({ formEle, element, touched, updateValidatorState }: IValidatorsProps) {
  const value = element[formEle.fieldName]

  useEffect(() => {
    updateValidatorState(SUPPORTED_VALIDATORS.required, value !== '' && value !== undefined && value !== null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // The asterisk on the label already marks the field: the message appears only when it is left empty.
  if (value || !touched) {
    return null
  }

  return (<div className="ml-1 text-red-600 text-xs italic">This field is required</div>)
}, (prevProps, nextProps) => prevProps.element[prevProps.formEle.fieldName] === nextProps.element[nextProps.formEle.fieldName] &&
    prevProps.touched === nextProps.touched)
