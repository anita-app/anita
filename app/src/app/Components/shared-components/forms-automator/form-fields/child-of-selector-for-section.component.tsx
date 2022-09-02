import { RESERVED_AUDS_KEYS, SectionElement } from 'app/data/project-structure/project-info'
import { AnitaStore } from 'app/libs/redux/reducers.const'
import { IOption, ParentElement } from 'app/models/ParentElement/ParentElement.class'
import { IBasicSelect, ICommonFormEleProps } from 'app/components/shared-components/forms-automator/form-automator.types'
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
import { useSelector } from 'react-redux'
import Select, { MultiValue } from 'react-select'

export const ChildOfSelectorForSection: React.FC<ICommonFormEleProps<IBasicSelect<SectionElement>>> = memo(function ChildOfSelectorForSection ({ formEle, element, handleChange, sectionId }: ICommonFormEleProps<IBasicSelect<SectionElement>>) {
  const currentEditedProjectSections = useSelector((state: AnitaStore) => state.formProject.project[RESERVED_AUDS_KEYS._sections])
  const [selectOptions, setSelectOptions] = useState<Array<IOption>>([])

  const [touched, setTouched] = useState(false)
  const { current: fieldId } = useRef(uniqueId(formEle.fieldName))
  const [isValid, setIsValidForField] = useValidators(fieldId)

  useEffect(() => {
    let isMounted = true

    const buildOptions = () => {
      if (!Array.isArray(currentEditedProjectSections)) {
        return
      }

      const selectableSections: Array<IOption> = []
      currentEditedProjectSections.forEach(sectionDec => {
        if (sectionDec.id !== sectionId) {
          selectableSections.push({
            value: sectionDec.id,
            label: sectionDec.title
          })
        }
      })
      setSelectOptions(selectableSections)
    }

    if (isMounted) {
      buildOptions()
    }

    return () => {
      isMounted = false
    }
  }, [currentEditedProjectSections, currentEditedProjectSections?.length, sectionId])

  const handleChangeInChildOfSelectorForSection = (newValue: MultiValue<IOption>) => {
    handleChange(formEle.fieldName, ParentElement.infoObjectToString(newValue as Array<IOption>))
  }

  if (selectOptions.length === 0) {
    return null
  }

  // We uas as any because react-select does not export the values we'd like to use,
  // and the ones we define are not compatible.
  return (<FormEleContainer width="w-full">
    <FormElementLabel label={formEle.label!} />
    <Select
      defaultValue={ParentElement.infoStringToObj(element[formEle.fieldName], selectOptions as any)}
      isMulti={true}
      name={formEle.fieldName}
      options={selectOptions as any}
      className={!isValid && touched ? 'border border-red-600 rounded' : ''}
      onChange={handleChangeInChildOfSelectorForSection}
      onBlur={() => setTouched(true)}
    />
    <ValidatorsContainer formEle={formEle} element={element} fieldId={fieldId} touched={touched} setIsValidForField={setIsValidForField} />
          </FormEleContainer>
  )
}, (prevProps, nextProps) => prevProps.element[prevProps.formEle.fieldName] === nextProps.element[nextProps.formEle.fieldName])
