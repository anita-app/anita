import { AnitaStore } from 'app/libs/redux/reducers.const';
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const';
import { store } from 'app/libs/redux/state.store';
import { checkIsValidValueForControlledReactForm } from 'app/libs/tools/check-is-valid-value-for-controlled-react-form.function';
import { calcWidth } from 'app/ui-react-components/shared-components/forms-automator/form-builder/calc-width.function';
import { ICommonFormEleProps } from 'app/ui-react-components/shared-components/forms-automator/form-fields/form-fields-model';
import { FORM_ELEMENTS_CSS_CLASSES, FORM_ELEMENTS_CSS_CLASSES_ERR } from 'app/ui-react-components/shared-components/forms-automator/form-layout/fom-elements-css-classes.const';
import { FormEleContainer } from 'app/ui-react-components/shared-components/forms-automator/form-layout/form-ele-container.component';
import { FormElementLabel } from 'app/ui-react-components/shared-components/forms-automator/form-layout/form-element-label.component';
import { ValidatorsContainer } from 'app/ui-react-components/shared-components/forms-automator/validators/validators-container.component';
import uniqueId from 'lodash/uniqueId';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

export const BasicInput = ({ formEle, element, handleChange }: ICommonFormEleProps) => {

  const [touched, setTouched] = useState(false);
  const { current: fieldId } = useRef(uniqueId(formEle.fieldName))
  const validStore = useSelector((store: AnitaStore) => store.formElesValidState);
  const isInValid = Object.keys(validStore).some(key => key.startsWith(fieldId) && validStore[key] === false);

  useEffect(() => {
    return () => {
      store.dispatch({ type: REDUX_ACTIONS.unsetValidStateForEle, payload: fieldId });
    }
  }, [fieldId]);

  const width = formEle['width'] ? calcWidth(formEle['width']) : "w-full";

  return (
    <FormEleContainer width={width}>
      <FormElementLabel label={formEle['label']} />
      <input
        key={formEle.fieldName}
        name={formEle.fieldName}
        type="text"
        placeholder={formEle['label']}
        disabled={formEle.disabled ? formEle.disabled : false}
        required={formEle.required ? formEle.required : false}
        className={`w-full ${isInValid && touched ? FORM_ELEMENTS_CSS_CLASSES_ERR : FORM_ELEMENTS_CSS_CLASSES}`}
        value={checkIsValidValueForControlledReactForm(element, formEle.fieldName) ? element[formEle.fieldName] : ''}
        onChange={event => handleChange(formEle.fieldName, event.target.value)}
        onBlur={() => setTouched(true)}
      />
      <ValidatorsContainer formEle={formEle} element={element} fieldId={fieldId} touched={touched} />
    </FormEleContainer>
  )
};