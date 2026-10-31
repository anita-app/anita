import { FormEleContainer } from 'app/components/shared-components/forms-automator/form-layout/form-ele-container.component'
import { FormElementLabel } from 'app/components/shared-components/forms-automator/form-layout/form-element-label.component'
import { ValidatorsContainer } from 'app/components/shared-components/forms-automator/form-validation/validators-container.component'
import { useValidators } from 'app/components/shared-components/forms-automator/hooks/use-validators.hook'
import uniqueId from 'lodash/uniqueId'
import { memo, useRef, useState } from 'react'
import type { FC } from 'react'
import type { ICommonFormEleProps } from 'app/components/shared-components/forms-automator/form-automator.types'

/**
 * @feature field.checkbox
 * @title Check box field
 * @summary A yes/no field, ticked or not, such as "Done" or "Paid".
 * @where Project editor: a field with Data type "Check box". Ticked in the form to add or edit a record, and directly in the table view and on the details page.
 * @usage In the project editor, give the field the Data type "Check box". In the form of a record, click the box to tick or untick it. In the table view or on the details page, click the box to change it without opening the form.
 * @options none
 * @rules A new record starts with the box not ticked. In the table view and on the details page, clicking the box saves the record (and syncs it) at once. In the tabs of linked records a ticked box is shown as a green check mark and cannot be changed there. If the field is required, a record whose box has never been ticked cannot be saved; once it has been ticked, unticking it is allowed.
 * @errors none
 * @status stable
 * @since 0.1.0
 * @covers field:basicCheckbox
 * @related field.required
 */
export const BasicCheckbox: FC<ICommonFormEleProps> = memo(function BasicCheckbox ({ formEle, element, handleChange }: ICommonFormEleProps) {
  const [touched, setTouched] = useState(false)
  const { current: fieldId } = useRef(uniqueId(formEle.fieldName))
  const [isValid, setIsValidForField] = useValidators(fieldId)

  const width = formEle.width ? formEle.width : 'w-full'

  return (
    <FormEleContainer width={width}>
      <FormElementLabel
        label={formEle.label!}
        required={!!formEle.required}
        labelHint={formEle.labelHint}
      />
      <input
        key={formEle.fieldName}
        name={formEle.fieldName}
        type="checkbox"
        checked={(Reflect.has(element, formEle.fieldName) && typeof element[formEle.fieldName] === 'boolean') ? element[formEle.fieldName] : false}
        className={`rounded mt-3 ${!isValid && touched ? 'text-red-600 border border-red-600' : 'text-prussian-blue-500'}`}
        onChange={event => handleChange(formEle.fieldName, event.target.checked)}
        onBlur={() => setTouched(true)}
      />
      <ValidatorsContainer
        formEle={formEle}
        element={element}
        fieldId={fieldId}
        touched={touched}
        setIsValidForField={setIsValidForField}
      />
    </FormEleContainer>
  )
}, (prevProps, nextProps) => prevProps.element[prevProps.formEle.fieldName] === nextProps.element[nextProps.formEle.fieldName])
