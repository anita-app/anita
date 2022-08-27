import { SectionElement } from 'app/data/project-structure/project-info'
import { IBasicSelect, ICommonFormEleProps } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types'
import { calcWidth } from 'app/ui-react-components/shared-components/forms-automator/form-builder/calc-width.function'
import { FORM_ELEMENTS_CSS_CLASSES, FORM_ELEMENTS_CSS_CLASSES_ERR } from 'app/ui-react-components/shared-components/forms-automator/form-layout/fom-elements-css-classes.const'
import { FormEleContainer } from 'app/ui-react-components/shared-components/forms-automator/form-layout/form-ele-container.component'
import { FormElementLabel } from 'app/ui-react-components/shared-components/forms-automator/form-layout/form-element-label.component'
import { ValidatorsContainer } from 'app/ui-react-components/shared-components/forms-automator/form-validation/validators-container.component'
import { useSetDefaultValue } from 'app/ui-react-components/shared-components/forms-automator/hooks/use-set-default-value'
import { useValidators } from 'app/ui-react-components/shared-components/forms-automator/hooks/use-validators.hook'
import uniqueId from 'lodash/uniqueId'
import { memo, useRef, useState } from 'react'

export const BasicSelect: React.FC<ICommonFormEleProps<IBasicSelect<SectionElement>>> = memo(function BasicSelect({ formEle, element, handleChange }: ICommonFormEleProps<IBasicSelect<SectionElement>>) {

  const [touched, setTouched] = useState(false);
  const { current: fieldId } = useRef(uniqueId(formEle.fieldName))
  const [isValid, setIsValidForField] = useValidators(fieldId)

  const width = formEle['width'] ? calcWidth(formEle['width']) : "w-full";

  // check that the value of element[formEle.fieldName] is a value in formEle.options
  // Use a relaxed equality check to consider numbers and strings the same
  // eslint-disable-next-line eqeqeq
  const isValidOptionsValue = element[formEle.fieldName] && formEle.options.some(option => option.value == element[formEle.fieldName])
  const currentValueIfValidOrNull = isValidOptionsValue ? element[formEle.fieldName] : null

  useSetDefaultValue(currentValueIfValidOrNull, formEle.value, formEle.fieldName, handleChange)

  return (
    <FormEleContainer width={width}>
      <FormElementLabel label={formEle['label']} />
      <select
        className={`w-full ${!isValid && touched ? FORM_ELEMENTS_CSS_CLASSES_ERR : FORM_ELEMENTS_CSS_CLASSES}`}
        value={element[formEle.fieldName]}
        onChange={event => handleChange(formEle.fieldName, event.target.value)}
        onBlur={() => setTouched(true)}
      >
        {!formEle.value && <option value="">Chose one</option>}
        {formEle.options.map((option, index) => (
          <option
            key={`${option.value}-${index}`}
            value={option.value}
          >{option.label}</option>)
        )}
      </select>
      {(!formEle.value || element[formEle.fieldName]) && <ValidatorsContainer formEle={formEle} element={element} fieldId={fieldId} touched={touched} setIsValidForField={setIsValidForField} />}
    </FormEleContainer>
  )
}, (prevProps, nextProps) => {
  let prereqisiteValuesAreEqual = true
  if (prevProps.formEle?.prerequisites?.length) {
    const propsToCheck = prevProps.formEle?.prerequisites.map(prerequisite => Object.keys(prerequisite)).flat().filter((value, index, array) => array.indexOf(value) === index);
    propsToCheck.forEach(prop => {
      if (prevProps.element[prop] !== nextProps.element[prop]) {
        prereqisiteValuesAreEqual = false;
      }
    })
  }
  return prevProps.element[prevProps.formEle.fieldName] === nextProps.element[nextProps.formEle.fieldName] && prereqisiteValuesAreEqual;
});