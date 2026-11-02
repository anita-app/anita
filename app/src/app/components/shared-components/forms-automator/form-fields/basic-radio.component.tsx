import { FormEleContainer } from 'app/components/shared-components/forms-automator/form-layout/form-ele-container.component'
import { FormElementLabel } from 'app/components/shared-components/forms-automator/form-layout/form-element-label.component'
import { ValidatorsContainer } from 'app/components/shared-components/forms-automator/form-validation/validators-container.component'
import { useValidators } from 'app/components/shared-components/forms-automator/hooks/use-validators.hook'
import uniqueId from 'lodash/uniqueId'
import { memo, useRef, useState } from 'react'
import { BasicRadioInfoIcon } from 'app/components/shared-components/forms-automator/form-fields/basic-radio-info-icon.component'
import type { FC } from 'react'
import type { ISectionElement } from 'app/models/section-element/section-element.declarations'
import type { IBasicRadio, ICommonFormEleProps } from 'app/components/shared-components/forms-automator/form-automator.types'
/* eslint-disable eqeqeq */

/**
 * @feature field.alternative-choice
 * @title Alternative choice field
 * @summary Pick one value among a few choices, all visible at once as round buttons.
 * @where Project editor: a field with Data type "Alternative choice" and its "Choices". In the form of a record, one round button per choice; the chosen value is shown as a coloured label in lists and on the details page.
 * @usage Define the choices of the field in the project editor. In the form of a record, click the round button of the choice.
 * @options The choices of the field (see "Choices of a drop-down or alternative choice"). No choice is selected at first.
 * @rules Only one choice can be selected. Once a choice is selected the field cannot be emptied again, only changed to another choice. The chosen value is shown like the one of a drop-down list: a label coloured by the position of the choice. Better suited than a drop-down list when the choices are few. If the field is required, "This field is required" appears when it is left empty.
 * @errors none
 * @status stable
 * @since 0.1.0
 * @covers field:basicRadio
 * @related field.choices, field.drop-down, field.required
 */
export const BasicRadio: FC<ICommonFormEleProps<IBasicRadio<ISectionElement>>> = memo(function BasicRadio ({ formEle, element, handleChange }: ICommonFormEleProps<IBasicRadio<ISectionElement>>) {
  const [touched, setTouched] = useState(false)
  const { current: fieldId } = useRef(uniqueId(formEle.fieldName))
  const [isValid, setIsValidForField] = useValidators(fieldId)

  const width = formEle.width ? formEle.width : 'w-full'

  if (!element[formEle.fieldName] && formEle.value) {
    element[formEle.fieldName] = formEle.value
  }

  // We use relaxed equal (==) here because the value of the radio button might be a string or a number.
  return (
    <FormEleContainer
      key={formEle.fieldName}
      width={width}
      advancedModeOnly={formEle.advancedModeOnly}
    >
      <FormElementLabel
        label={formEle.label!}
        required={!!formEle.required}
        labelHint={formEle.labelHint}
      />
      <div className="mt-2 pl-1">
        {formEle.options.map((option, indexOption) => (
          <div
            key={option.value}
            className="mb-2"
          >
            <input
              type="radio"
              value={option.value}
              name={formEle.fieldName}
              checked={element[formEle.fieldName] == option.value}
              disabled={!!(option.disabled || formEle.disabled)}
              className={`${!isValid && touched ? 'bg-red-600 text-red-600' : 'bg-gray-200 text-prussian-blue-500'} mr-2 border-transparent focus:border-gray-500 focus:text-prussian-blue-600 focus:ring-prussian-blue-600`}
              onChange={event => handleChange(formEle.fieldName, event.target.value)}
              onBlur={() => setTouched(true)}
            />
            <span className={option.disabled || formEle.disabled ? 'text-gray-300 cursor-not-allowed' : ''}>{option.label}</span>
            {option.hint && (
              <BasicRadioInfoIcon
                fieldId={fieldId}
                indexOption={indexOption}
                optionHint={option.hint}
              />
            )}
          </div>
        ))}
      </div>
      <ValidatorsContainer
        formEle={formEle}
        element={element}
        fieldId={fieldId}
        touched={touched}
        setIsValidForField={setIsValidForField}
      />
    </FormEleContainer>
  )
}, (prevProps, nextProps) => prevProps.element[prevProps.formEle.fieldName] == nextProps.element[nextProps.formEle.fieldName])
