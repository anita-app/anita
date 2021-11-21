import { AnitaStore } from 'app/libs/redux/reducers.const';
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const';
import { store } from 'app/libs/redux/state.store';
import { ICommonFormEleProps } from 'app/ui-react-components/shared-components/forms-automator/form-fields/form-fields-model';
import { FormEleContainer } from 'app/ui-react-components/shared-components/forms-automator/form-layout/form-ele-container.component';
import { FormElementLabel } from 'app/ui-react-components/shared-components/forms-automator/form-layout/form-element-label.component';
import { ValidatorsContainer } from 'app/ui-react-components/shared-components/forms-automator/validators/validators-container.component';
import uniqueId from 'lodash/uniqueId';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

export const BasicCheckbox = ({ formEle, element, handleChange }: ICommonFormEleProps) => {

  const [touched, setTouched] = useState(false);
  const { current: fieldId } = useRef(uniqueId(formEle.fieldName))
  const validStore = useSelector((store: AnitaStore) => store.formElesValidState);
  const isInValid = Object.keys(validStore).some(key => key.startsWith(fieldId) && validStore[key] === false);

  useEffect(() => {
    return () => {
      store.dispatch({ type: REDUX_ACTIONS.unsetValidStateForEle, payload: fieldId });
    }
  }, [fieldId]);

  const width = formEle['width'] ? formEle['width'] : "w-full";

  return (
    <FormEleContainer width={width}>
      <FormElementLabel label={formEle['label']} />
      <input key={formEle.fieldName}
        name={formEle.fieldName}
        type="checkbox"
        checked={(Reflect.has(element, formEle.fieldName) && typeof element[formEle.fieldName] === 'boolean') ? element[formEle.fieldName] : false}
        className={`rounded mt-3 ${isInValid && touched ? "text-red-600 border border-red-600" : "text-prussian-blue-500"}`}
        onChange={event => handleChange(formEle.fieldName, event.target.checked)}
        onBlur={() => setTouched(true)}
      />
      <ValidatorsContainer formEle={formEle} element={element} fieldId={fieldId} touched={touched} />
    </FormEleContainer>
  )
};