import { SectionElement } from 'app/data/model/project-info';
import { AnitaStore } from 'app/libs/redux/reducers.const';
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const';
import { store } from 'app/libs/redux/state.store';
import { IBasicRadio, ICommonFormEleProps } from 'app/ui-react-components/shared-components/forms-automator/form-fields/form-fields-model';
import { FormEleContainer } from 'app/ui-react-components/shared-components/forms-automator/form-layout/form-ele-container.component';
import { FormElementLabel } from 'app/ui-react-components/shared-components/forms-automator/form-layout/form-element-label.component';
import { ValidatorsContainer } from 'app/ui-react-components/shared-components/forms-automator/validators/validators-container.component';
import uniqueId from 'lodash/uniqueId';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

/* eslint-disable eqeqeq */

export const BasicRadio = ({ formEle, element, handleChange }: ICommonFormEleProps<IBasicRadio<SectionElement>>) => {

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

  // We use relaxed equal (==) here because the value of the radio button might be a string or a number.
  return (
    <FormEleContainer key={formEle.fieldName} width={width}>
      <FormElementLabel label={formEle['label']} />
      <div className="mt-2 pl-1"
      >
        {formEle.options.map(option => {
          return (
            <div key={option.value} className="mb-2">
              <input
                type="radio"
                value={option.value}
                name={formEle.fieldName}
                checked={element[formEle.fieldName] == option.value}
                className={`${isInValid && touched ? "bg-red-600 text-red-600" : "bg-gray-200 text-prussian-blue-500"} mr-2 border-transparent focus:border-gray-500 focus:text-prussian-blue-600 focus:ring-prussian-blue-600`}
                onChange={event => handleChange(formEle.fieldName, event.target['value'])}
                onBlur={() => setTouched(true)}
              /> {option.label}
            </div>
          )
        })}
      </div>
      <ValidatorsContainer formEle={formEle} element={element} fieldId={fieldId} touched={touched} />
    </FormEleContainer>
  )
};