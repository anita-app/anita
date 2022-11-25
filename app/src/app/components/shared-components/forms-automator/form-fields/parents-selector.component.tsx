import { ISectionElement } from 'app/models/section-element/section-element.declarations'
import { Manager } from 'app/libs/manager/manager.class'
import { IOption, ParentElement } from 'app/models/parent-element/parent-element.class'
import { IBasicSelect, ICommonFormEleProps, OptionKeysModelGroup } from 'app/components/shared-components/forms-automator/form-automator.types'
import { FormEleContainer } from 'app/components/shared-components/forms-automator/form-layout/form-ele-container.component'
import { FormElementLabel } from 'app/components/shared-components/forms-automator/form-layout/form-element-label.component'
import { ValidatorsContainer } from 'app/components/shared-components/forms-automator/form-validation/validators-container.component'
import { useValidators } from 'app/components/shared-components/forms-automator/hooks/use-validators.hook'
import uniqueId from 'lodash/uniqueId'
import React, {
  memo,
  useEffect,
  useRef,
  useState
} from 'react'
import Select, { MultiValue } from 'react-select'
export const ParentsSelector: React.FC<ICommonFormEleProps<IBasicSelect<ISectionElement>>> = memo(function ParentsSelector ({ formEle, element, handleChange }: ICommonFormEleProps<IBasicSelect<ISectionElement>>) {
  const [selectOptions, setSelectOptions] = useState<Array<OptionKeysModelGroup>>([])

  const [touched, setTouched] = useState(false)
  const { current: fieldId } = useRef(uniqueId(formEle.fieldName))
  const [isValid, setIsValidForField] = useValidators(fieldId)

  useEffect(() => {
    let isMounted = true

    const getSelectOptions = async () => {
      const options = await Manager.getCurrentProject()?.getOptionsForParentsSelector(formEle.options)

      if (isMounted && options) {
        setSelectOptions(options)
      }
    }

    if (isMounted) {
      getSelectOptions()
    }

    return () => {
      isMounted = false
    }
  }, [formEle.options])

  const handleChangeInParentsSelector = (newValue: MultiValue<IOption>) => {
    handleChange(formEle.fieldName, ParentElement.infoObjectToString(newValue as Array<IOption>))
  }

  if (selectOptions.length === 0) {
    return null
  }

  // We uas as any because react-select does not export the values we'd like to use,
  // and the ones we define are not compatible.
  return (
    <FormEleContainer width="w-full">
      <FormElementLabel label={formEle.label!} labelHint={formEle.labelHint} />
      <Select
        defaultValue={ParentElement.infoStringToObjForOptionsGroup(element[formEle.fieldName], selectOptions as any)}
        isMulti={true}
        name={formEle.fieldName}
        options={selectOptions as any}
        className={!isValid && touched ? 'border border-red-600 rounded' : ''}
        onChange={handleChangeInParentsSelector}
        onBlur={() => setTouched(true)}
      />
      <ValidatorsContainer formEle={formEle} element={element} fieldId={fieldId} touched={touched} setIsValidForField={setIsValidForField} />
    </FormEleContainer>
  )
}, (prevProps, nextProps) => (
  prevProps.element[prevProps.formEle.fieldName] === nextProps.element[nextProps.formEle.fieldName] &&
  prevProps.formEle.options === nextProps.formEle.options
))
