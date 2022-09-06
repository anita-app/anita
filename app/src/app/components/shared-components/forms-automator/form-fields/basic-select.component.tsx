import { ISectionElement } from 'app/models/section-element/section-element.declarations'
import { IBasicSelect, ICommonFormEleProps } from 'app/components/shared-components/forms-automator/form-automator.types'
import { calcWidth } from 'app/components/shared-components/forms-automator/form-builder/calc-width.function'
import { FORM_ELEMENTS_CSS_CLASSES, FORM_ELEMENTS_CSS_CLASSES_ERR } from 'app/components/shared-components/forms-automator/form-layout/fom-elements-css-classes.const'
import { FormEleContainer } from 'app/components/shared-components/forms-automator/form-layout/form-ele-container.component'
import { FormElementLabel } from 'app/components/shared-components/forms-automator/form-layout/form-element-label.component'
import { ValidatorsContainer } from 'app/components/shared-components/forms-automator/form-validation/validators-container.component'
import { useSetDefaultValue } from 'app/components/shared-components/forms-automator/hooks/use-set-default-value'
import { useValidators } from 'app/components/shared-components/forms-automator/hooks/use-validators.hook'
import uniqueId from 'lodash/uniqueId'
import React, { memo, useRef, useState, Fragment } from 'react'
import { Combobox, Transition } from '@headlessui/react'
import { Icons } from 'app/libs/icons/icons.class'
import { IOption } from 'app/models/parent-element/parent-element.class'

export const BasicSelect: React.FC<ICommonFormEleProps<IBasicSelect<ISectionElement>>> = memo(function BasicSelect ({ formEle, element, handleChange }: ICommonFormEleProps<IBasicSelect<ISectionElement>>) {
  const [touched, setTouched] = useState(false)
  const [query, setQuery] = useState('')
  const { current: fieldId } = useRef(uniqueId(formEle.fieldName))
  const [isValid, setIsValidForField] = useValidators(fieldId)

  const width = formEle.width ? calcWidth(formEle.width) : 'w-full'

  // check that the value of element[formEle.fieldName] is a value in formEle.options
  // Use a relaxed equality check to consider numbers and strings the same
  // eslint-disable-next-line eqeqeq
  const isValidOptionsValue = element[formEle.fieldName] && formEle.options.some(option => option.value == element[formEle.fieldName])
  const currentValueIfValidOrNull = isValidOptionsValue ? element[formEle.fieldName] : null
  const selectedOption = formEle.options.find(option => option.value === currentValueIfValidOrNull) || null

  useSetDefaultValue(currentValueIfValidOrNull, formEle.value!, formEle.fieldName, handleChange)

  const filteredOptions =
  query === ''
    ? formEle.options
    : formEle.options.filter((option) => option.value?.toString()
      .toLowerCase()
      .replace(/\s+/g, '')
      .includes(query.toLowerCase().replace(/\s+/g, ''))
    )

  const handleSelected = (option: IOption): void => {
    handleChange(formEle.fieldName, option.value)
  }

  const handleClear = (e: React.MouseEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    handleChange(formEle.fieldName, null)
  }

  return (
    <FormEleContainer width={width}>
      <FormElementLabel label={formEle.label!} />
      <Combobox value={selectedOption} onChange={handleSelected}>
        <div className="relative">
          <div className={`relative w-full cursor-default overflow-hidden bg-white text-left sm:text-sm ${isValid || ''}`}>
            <Combobox.Input
              className={`w-full h-[42px] pr-10 text-sm leading-5 focus:ring-0 rounded-md ${!isValid && touched ? FORM_ELEMENTS_CSS_CLASSES_ERR : FORM_ELEMENTS_CSS_CLASSES}`}
              displayValue={(option) => (option as IOption)?.label}
              onChange={(event) => setQuery(event.target.value)}
              onBlur={() => setTouched(true)}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              {Icons.render('codeOutline', 'rotate-90 h-5 w-5 text-gray-400')}
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
              {filteredOptions.length === 0 && query !== ''
                ? (
                  <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                    Nothing found.
                  </div>
                  )
                : (
                    filteredOptions.map((option) => (
                      <Combobox.Option
                        key={option.value}
                        className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-prussian-blue-600 text-white' : 'text-gray-900'
                      }`}
                        value={option}
                      >
                        {({ selected, active }) => (
                          <>
                            <span
                              className={`block truncate ${
                            selected ? 'font-medium' : 'font-normal'
                          }`}
                            >
                              {option.label}
                            </span>
                            {(selected || option.icon) && (
                            <span
                              className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-white' : selected ? 'text-teal-500' : 'text-prussian-blue-600'
                            }`}
                            >
                              {Icons.render(selected ? 'checkmark' : option.icon!, 'h-5 w-5')}
                            </span>
                            )}
                            {(selected) && (
                            <span
                              className={`absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer ${
                              active ? 'text-white' : 'text-prussian-blue-600'
                                  }`}
                              onClick={handleClear}
                            >
                              {Icons.render('closeCircleOutline', 'h-5 w-5')}
                            </span>
                            )}
                          </>
                        )}
                      </Combobox.Option>
                    ))
                  )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
      {(!formEle.value || element[formEle.fieldName]) && <ValidatorsContainer formEle={formEle} element={element} fieldId={fieldId} touched={touched} setIsValidForField={setIsValidForField} />}
    </FormEleContainer>
  )
}, (prevProps, nextProps) => {
  let prereqisiteValuesAreEqual = true
  if (prevProps.formEle?.prerequisites?.length) {
    const propsToCheck = prevProps.formEle?.prerequisites.map(prerequisite => Object.keys(prerequisite)).flat().filter((value, index, array) => array.indexOf(value) === index)
    propsToCheck.forEach(prop => {
      if (prevProps.element[prop] !== nextProps.element[prop]) {
        prereqisiteValuesAreEqual = false
      }
    })
  }
  return prevProps.element[prevProps.formEle.fieldName] === nextProps.element[nextProps.formEle.fieldName] && prereqisiteValuesAreEqual
})

/**
 *
 <FormEleContainer width={width}>
  <FormElementLabel label={formEle.label} />
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
      >{option.label}
      </option>)
    )}
  </select>
  {(!formEle.value || element[formEle.fieldName]) && <ValidatorsContainer formEle={formEle} element={element} fieldId={fieldId} touched={touched} setIsValidForField={setIsValidForField} />}
</FormEleContainer>
 */
