import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { storeDispatcher } from 'app/libs/redux/store-dispatcher.function'
import { ICommonFormEleProps } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types'
import { FORM_ELEMENTS_CSS_CLASSES, FORM_ELEMENTS_CSS_CLASSES_ERR } from 'app/ui-react-components/shared-components/forms-automator/form-layout/fom-elements-css-classes.const'
import { FormEleContainer } from 'app/ui-react-components/shared-components/forms-automator/form-layout/form-ele-container.component'
import { FormElementLabel } from 'app/ui-react-components/shared-components/forms-automator/form-layout/form-element-label.component'
import { useValidators } from 'app/ui-react-components/shared-components/forms-automator/hooks/use-validators.hook'
import { ValidatorsContainer } from 'app/ui-react-components/shared-components/forms-automator/validators/validators-container.component'
import uniqueId from 'lodash/uniqueId'
import {
  memo,
  useEffect,
  useRef,
  useState
  } from 'react'

export const BasicTextarea = memo(function BasicTextarea({ formEle, element, handleChange }: ICommonFormEleProps) {

  const [touched, setTouched] = useState(false);
  const { current: fieldId } = useRef(uniqueId(formEle.fieldName))
  const isInValid = useValidators(fieldId)

  useEffect(() => {
    return () => {
      storeDispatcher({ type: REDUX_ACTIONS.unsetValidStateForEle, payload: fieldId });
    }
  }, [fieldId]);

  const width = formEle['width'] ? formEle['width'] : "w-full";

  if (element[formEle.fieldName] === undefined || element[formEle.fieldName] === null)
    element[formEle.fieldName] = '';

  return (
    <FormEleContainer width={width}>
      <FormElementLabel label={formEle['label']} />
      <textarea
        name={formEle.fieldName}
        className={`w-full ${isInValid && touched ? FORM_ELEMENTS_CSS_CLASSES_ERR : FORM_ELEMENTS_CSS_CLASSES}`}
        value={element[formEle.fieldName]}
        onChange={event => handleChange(formEle.fieldName, event.target.value)}
        onBlur={() => setTouched(true)}
      />
      <ValidatorsContainer formEle={formEle} element={element} fieldId={fieldId} touched={touched} />
    </FormEleContainer>
  )
}, (prevProps, nextProps) => {
  return prevProps.element[prevProps.formEle.fieldName] === nextProps.element[nextProps.formEle.fieldName]
});