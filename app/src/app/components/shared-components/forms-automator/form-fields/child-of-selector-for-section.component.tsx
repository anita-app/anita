import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { ParentElement } from 'app/models/parent-element/parent-element.class'
import { FormEleContainer } from 'app/components/shared-components/forms-automator/form-layout/form-ele-container.component'
import { FormElementLabel } from 'app/components/shared-components/forms-automator/form-layout/form-element-label.component'
import { ValidatorsContainer } from 'app/components/shared-components/forms-automator/form-validation/validators-container.component'
import { useValidators } from 'app/components/shared-components/forms-automator/hooks/use-validators.hook'
import uniqueId from 'lodash/uniqueId'
import {
  memo,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Select } from 'app/components/shared-components/common-ui-eles/select.component'
import { formSelectStyles } from 'app/components/shared-components/forms-automator/form-layout/select-styles.const'
import { useAtomValue } from 'jotai'
import { FormProjectAtoms } from 'app/state/form-project/form-project.atoms'
import type { FC } from 'react'
import type { MultiValue } from 'react-select'
import type { IBasicSelect, ICommonFormEleProps } from 'app/components/shared-components/forms-automator/form-automator.types'
import type { IOption } from 'app/models/parent-element/parent-element.class'
import type { ISectionElement } from 'app/models/section-element/section-element.declarations'

/**
 * @feature relation.parent-sections
 * @title Parent sections
 * @summary Make a section the child of other sections, so that its records can be linked to records of those sections (e.g. Tasks linked to Projects).
 * @where Project editor, in the settings of a section: the "Parent sections:" field.
 * @usage In the project editor, open the section that will hold the child records and choose one or more sections in "Parent sections:". Remove a parent with the × on its tag. Save the project.
 * @options Any other section of the project; several parent sections are allowed. Default: none.
 * @rules The field appears only when the project has at least one other section; a section cannot be its own parent. Once a section has parent sections, the form of its records shows the "Linked to" field, and the records of the parent sections show tabs with the records linked to them.
 * @errors none
 * @status stable
 * @since 0.3.0
 * @related relation.link-to-parent
 */
export const ChildOfSelectorForSection: FC<ICommonFormEleProps<IBasicSelect<ISectionElement>>> = memo(function ChildOfSelectorForSection ({ formEle, element, handleChange, sectionId }: ICommonFormEleProps<IBasicSelect<ISectionElement>>) {
  const currentProject = useAtomValue(FormProjectAtoms.project)
  const currentEditedProjectSections = currentProject[RESERVED_AUDS_KEYS._sections]
  const [selectOptions, setSelectOptions] = useState<Array<IOption>>([])

  const [touched, setTouched] = useState(false)
  const { current: fieldId } = useRef(uniqueId(formEle.fieldName))
  const [isValid, setIsValidForField] = useValidators(fieldId)

  useEffect(() => {
    const buildOptions = () => {
      if (!Array.isArray(currentEditedProjectSections)) {
        return
      }

      const selectableSections: Array<IOption> = []
      currentEditedProjectSections.forEach(sectionDec => {
        if (sectionDec.id !== sectionId) {
          selectableSections.push({
            value: sectionDec.id,
            label: sectionDec.title,
          })
        }
      })
      setSelectOptions(selectableSections)
    }

    buildOptions()
  }, [currentEditedProjectSections, currentEditedProjectSections?.length, sectionId])

  const handleChangeInChildOfSelectorForSection = (newValue: MultiValue<IOption>) => {
    handleChange(formEle.fieldName, ParentElement.infoObjectToString(newValue as Array<IOption>))
  }

  if (selectOptions.length === 0) {
    return null
  }

  // We uas as any because react-select does not export the values we'd like to use,
  // and the ones we define are not compatible.
  return (
    <FormEleContainer width="w-full">
      <FormElementLabel
        label={formEle.label!}
        labelHint={formEle.labelHint}
      />
      <Select
        defaultValue={ParentElement.infoStringToObj(element[formEle.fieldName], selectOptions as any)}
        isMulti={true}
        name={formEle.fieldName}
        options={selectOptions as any}
        styles={formSelectStyles(!isValid && touched)}
        onChange={handleChangeInChildOfSelectorForSection}
        onBlur={() => setTouched(true)}
      />
      <ValidatorsContainer
        formEle={formEle}
        element={element}
        fieldId={fieldId}
        touched={touched}
        setIsValidForField={setIsValidForField}
      />
    </FormEleContainer>
  )
}, (prevProps, nextProps) => prevProps.element[prevProps.formEle.fieldName] === nextProps.element[nextProps.formEle.fieldName])
