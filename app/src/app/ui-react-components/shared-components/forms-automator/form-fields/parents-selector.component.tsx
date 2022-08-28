import { SectionElement } from 'app/data/project-structure/project-info'
import { Manager } from 'app/libs/Manager/Manager.class'
import { IOption, ParentElement } from 'app/Models/ParentElement/ParentElement.class'
import { IBasicSelect, ICommonFormEleProps, OptionKeysModelGroup } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types'
import { FormEleContainer } from 'app/ui-react-components/shared-components/forms-automator/form-layout/form-ele-container.component'
import { FormElementLabel } from 'app/ui-react-components/shared-components/forms-automator/form-layout/form-element-label.component'
import { ValidatorsContainer } from 'app/ui-react-components/shared-components/forms-automator/form-validation/validators-container.component'
import { useValidators } from 'app/ui-react-components/shared-components/forms-automator/hooks/use-validators.hook'
import uniqueId from 'lodash/uniqueId'
import React, {
  memo,
  useEffect,
  useRef,
  useState
} from 'react'
import Select, { MultiValue } from 'react-select'
export const ParentsSelector: React.FC<ICommonFormEleProps<IBasicSelect<SectionElement>>> = memo(function ParentsSelector ({ formEle, element, handleChange }: ICommonFormEleProps<IBasicSelect<SectionElement>>) {
  const [selectOptions, setSelectOptions] = useState<Array<OptionKeysModelGroup>>([])

  const [touched, setTouched] = useState(false)
  const { current: fieldId } = useRef(uniqueId(formEle.fieldName))
  const [isValid, setIsValidForField] = useValidators(fieldId)

  useEffect(() => {
    let isMounted = true

    const getSelectOptions = async () => {
      const options = await Manager.getCurrentProject().getOptionsForParentsSelector(formEle.options)

      if (isMounted) {
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
  return (<FormEleContainer width="w-full">
    <FormElementLabel label={formEle.label} />
    <Select
      defaultValue={ParentElement.infoStringToObjForOptionsGroup(element[formEle.fieldName], selectOptions)}
      isMulti={true}
      name={formEle.fieldName}
      options={selectOptions}
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
