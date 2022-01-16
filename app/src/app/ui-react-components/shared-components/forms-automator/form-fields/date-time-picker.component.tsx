import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { storeDispatcher } from 'app/libs/redux/store-dispatcher.function'
import { ICommonFormEleProps } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types'
import { calcWidth } from 'app/ui-react-components/shared-components/forms-automator/form-builder/calc-width.function'
import { FORM_ELEMENTS_CSS_CLASSES, FORM_ELEMENTS_CSS_CLASSES_ERR } from 'app/ui-react-components/shared-components/forms-automator/form-layout/fom-elements-css-classes.const'
import { FormEleContainer } from 'app/ui-react-components/shared-components/forms-automator/form-layout/form-ele-container.component'
import { FormElementLabel } from 'app/ui-react-components/shared-components/forms-automator/form-layout/form-element-label.component'
import { ValidatorsContainer } from 'app/ui-react-components/shared-components/forms-automator/form-validation/validators-container.component'
import { useValidators } from 'app/ui-react-components/shared-components/forms-automator/hooks/use-validators.hook'
import * as dateFormat from 'date-format'
import uniqueId from 'lodash/uniqueId'
import {
  memo,
  useEffect,
  useRef,
  useState
  } from 'react'

export const DateTimePicker = memo(function DateTimePicker({ formEle, element, handleChange }: ICommonFormEleProps) {

  const [touched, setTouched] = useState(false);
  const { current: fieldId } = useRef(uniqueId(formEle.fieldName))
  const [isValid, setIsValidForField] = useValidators(fieldId)

  useEffect(() => {
    return () => {
      storeDispatcher({ type: REDUX_ACTIONS.unsetValidStateForEle, payload: fieldId });
    }
  }, [fieldId]);

  const width = formEle['width'] ? calcWidth(formEle['width']) : "w-full";

  return (
    <FormEleContainer width={width}>
      <FormElementLabel label={formEle['label']} />
      <input
        key={formEle.fieldName}
        name={formEle.fieldName}
        type="datetime-local"
        placeholder={formEle['label']}
        className={`w-full ${!isValid && touched ? FORM_ELEMENTS_CSS_CLASSES_ERR : FORM_ELEMENTS_CSS_CLASSES}`}
        value={dateFormat("yyyy-MM-ddThh:mm:ss", new Date(element[formEle.fieldName]))}
        onChange={event => handleChange(formEle.fieldName, event.target.value)}
        onBlur={() => setTouched(true)}
      />
      <ValidatorsContainer formEle={formEle} element={element} fieldId={fieldId} touched={touched} setIsValidForField={setIsValidForField} />
    </FormEleContainer>
  );
}, (prevProps, nextProps) => {
  return prevProps.element[prevProps.formEle.fieldName] === nextProps.element[nextProps.formEle.fieldName]
});