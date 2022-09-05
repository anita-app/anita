import { ICommonFormEleProps } from 'app/components/shared-components/forms-automator/form-automator.types'
import { calcWidth } from 'app/components/shared-components/forms-automator/form-builder/calc-width.function'
import { FORM_ELEMENTS_CSS_CLASSES, FORM_ELEMENTS_CSS_CLASSES_ERR } from 'app/components/shared-components/forms-automator/form-layout/fom-elements-css-classes.const'
import { FormEleContainer } from 'app/components/shared-components/forms-automator/form-layout/form-ele-container.component'
import { FormElementLabel } from 'app/components/shared-components/forms-automator/form-layout/form-element-label.component'
import { ValidatorsContainer } from 'app/components/shared-components/forms-automator/form-validation/validators-container.component'
import { useValidators } from 'app/components/shared-components/forms-automator/hooks/use-validators.hook'
import uniqueId from 'lodash/uniqueId'
import React, { memo, useRef, useState } from 'react'

export const BasicInput: React.FC<ICommonFormEleProps> = memo(function BasicInput ({ formEle, element, handleChange }: ICommonFormEleProps) {
  const [touched, setTouched] = useState(false)
  const { current: fieldId } = useRef(uniqueId(formEle.fieldName))
  const [isValid, setIsValidForField] = useValidators(fieldId)

  const width = formEle.width ? calcWidth(formEle.width) : 'w-full'

  if (element[formEle.fieldName] === undefined || element[formEle.fieldName] === null) {
    element[formEle.fieldName] = ''
  }

  return (
    <FormEleContainer width={width}>
      <FormElementLabel label={formEle.label!} />
      <input
        key={formEle.fieldName}
        name={formEle.fieldName}
        type={formEle?.type || 'text'}
        placeholder={formEle.label}
        disabled={formEle.disabled ? formEle.disabled : false}
        required={formEle.required ? formEle.required : false}
        className={`w-full ${!isValid && touched ? FORM_ELEMENTS_CSS_CLASSES_ERR : FORM_ELEMENTS_CSS_CLASSES}`}
        value={element[formEle.fieldName]}
        onChange={event => handleChange(formEle.fieldName, event.target.value)}
        onBlur={() => setTouched(true)}
        autoComplete="off"
      />
      <ValidatorsContainer formEle={formEle} element={element} fieldId={fieldId} touched={touched} setIsValidForField={setIsValidForField} />
    </FormEleContainer>
  )
}, (prevProps, nextProps) => prevProps.element[prevProps.formEle.fieldName] === nextProps.element[nextProps.formEle.fieldName])
