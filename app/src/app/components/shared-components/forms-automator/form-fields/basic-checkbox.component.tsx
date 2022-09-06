import { ICommonFormEleProps } from 'app/components/shared-components/forms-automator/form-automator.types'
import { FormEleContainer } from 'app/components/shared-components/forms-automator/form-layout/form-ele-container.component'
import { FormElementLabel } from 'app/components/shared-components/forms-automator/form-layout/form-element-label.component'
import { ValidatorsContainer } from 'app/components/shared-components/forms-automator/form-validation/validators-container.component'
import { useValidators } from 'app/components/shared-components/forms-automator/hooks/use-validators.hook'
import uniqueId from 'lodash/uniqueId'
import React, { memo, useRef, useState } from 'react'

export const BasicCheckbox: React.FC<ICommonFormEleProps> = memo(function BasicCheckbox ({ formEle, element, handleChange }: ICommonFormEleProps) {
  const [touched, setTouched] = useState(false)
  const { current: fieldId } = useRef(uniqueId(formEle.fieldName))
  const [isValid, setIsValidForField] = useValidators(fieldId)

  const width = formEle.width ? formEle.width : 'w-full'

  return (
    <FormEleContainer width={width}>
      <FormElementLabel label={formEle.label!} />
      <input
        key={formEle.fieldName}
        name={formEle.fieldName}
        type="checkbox"
        checked={(Reflect.has(element, formEle.fieldName) && typeof element[formEle.fieldName] === 'boolean') ? element[formEle.fieldName] : false}
        className={`rounded mt-3 ${!isValid && touched ? 'text-red-600 border border-red-600' : 'text-prussian-blue-500'}`}
        onChange={event => handleChange(formEle.fieldName, event.target.checked)}
        onBlur={() => setTouched(true)}
      />
      <ValidatorsContainer formEle={formEle} element={element} fieldId={fieldId} touched={touched} setIsValidForField={setIsValidForField} />
    </FormEleContainer>
  )
}, (prevProps, nextProps) => prevProps.element[prevProps.formEle.fieldName] === nextProps.element[nextProps.formEle.fieldName])
