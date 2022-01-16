import { SectionElement } from 'app/data/project-structure/project-info'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { storeDispatcher } from 'app/libs/redux/store-dispatcher.function'
import { IBasicRadio, ICommonFormEleProps } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types'
import { FormEleContainer } from 'app/ui-react-components/shared-components/forms-automator/form-layout/form-ele-container.component'
import { FormElementLabel } from 'app/ui-react-components/shared-components/forms-automator/form-layout/form-element-label.component'
import { ValidatorsContainer } from 'app/ui-react-components/shared-components/forms-automator/form-validation/validators-container.component'
import { useValidators } from 'app/ui-react-components/shared-components/forms-automator/hooks/use-validators.hook'
import uniqueId from 'lodash/uniqueId'
import {
  memo,
  useEffect,
  useRef,
  useState
  } from 'react'
import ReactTooltip from 'react-tooltip'

/* eslint-disable eqeqeq */

export const BasicRadio = memo(function BasicRadio({ formEle, element, handleChange }: ICommonFormEleProps<IBasicRadio<SectionElement>>) {

  const [touched, setTouched] = useState(false);
  const { current: fieldId } = useRef(uniqueId(formEle.fieldName))
  const [isValid, setIsValidForField] = useValidators(fieldId)

  useEffect(() => {
    return () => {
      storeDispatcher({ type: REDUX_ACTIONS.unsetValidStateForEle, payload: fieldId });
    }
  }, [fieldId]);

  const width = formEle['width'] ? formEle['width'] : "w-full";

  if (!element[formEle.fieldName] && formEle.value)
    element[formEle.fieldName] = formEle.value;


  // We use relaxed equal (==) here because the value of the radio button might be a string or a number.
  return (
    <FormEleContainer key={formEle.fieldName} width={width}>
      <FormElementLabel label={formEle['label']} />
      <div className="mt-2 pl-1"
      >
        {formEle.options.map((option, indexOption) => {
          return (
            <div key={option.value} className="mb-2">
              <input
                type="radio"
                value={option.value}
                name={formEle.fieldName}
                checked={element[formEle.fieldName] == option.value}
                disabled={option.disabled || formEle.disabled ? true : false}
                className={`${!isValid && touched ? "bg-red-600 text-red-600" : "bg-gray-200 text-prussian-blue-500"} mr-2 border-transparent focus:border-gray-500 focus:text-prussian-blue-600 focus:ring-prussian-blue-600`}
                onChange={event => handleChange(formEle.fieldName, event.target['value'])}
                onBlur={() => setTouched(true)}
              />
              <span className={option.disabled || formEle.disabled ? 'text-gray-300 cursor-not-allowed' : ''}>{option.label}</span>
              {option.hint && (
                <span>
                  <sup><i className="ml-1 text-xs bi-info-circle" data-tip data-for={`${fieldId}${indexOption}`}></i></sup>
                  <ReactTooltip id={`${fieldId}${indexOption}`} effect="solid" data-multiline={true} className="msg-wrapper text-center">
                    <span>{option.hint}</span>
                  </ReactTooltip>
                </span>
              )}
            </div>
          )
        })}
      </div>
      <ValidatorsContainer formEle={formEle} element={element} fieldId={fieldId} touched={touched} setIsValidForField={setIsValidForField} />
    </FormEleContainer>
  )
}, (prevProps, nextProps) => {
  return prevProps.element[prevProps.formEle.fieldName] == nextProps.element[nextProps.formEle.fieldName]
});