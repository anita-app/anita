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
import Select from 'react-select'
import { formSelectStyles } from 'app/components/shared-components/forms-automator/form-layout/select-styles.const'
import { Bucket } from 'app/state/bucket.state'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import type { FC } from 'react'
import type { MultiValue } from 'react-select'
import type { IBasicSelect, ICommonFormEleProps, OptionKeysModelGroup } from 'app/components/shared-components/forms-automator/form-automator.types'
import type { IOption } from 'app/models/parent-element/parent-element.class'
import type { ISectionElement } from 'app/models/section-element/section-element.declarations'
/**
 * @feature relation.link-to-parent
 * @title Link a record to parent records
 * @summary Connect a record to one or more records of its parent sections, e.g. a task to its project, and open them from its details page.
 * @where Form to add or edit a record of a child section: the field "Linked to" followed by the names of the parent sections, at the top of the form. Details page: the links, grouped by parent section, as labels that open the parent record.
 * @usage Open the form of a record of a section that has parent sections. In "Linked to ...", open the list and choose the records (grouped by section and named by their name field); type to search them. Remove a link with the × on its tag. Save the record. A record added from the tab of a parent record is already linked to it.
 * @options Any record of the parent sections; several records, also of different sections, can be linked. Default: no link, or the parent record when the record is added from its tab.
 * @rules The field appears only when the section has parent sections and at least one of them has records. On the details page each parent section is a row with the name of the section; each link shows the name of the parent record, or "Untitled" when it has none. Links to records that no longer exist are not shown.
 * @errors none
 * @status stable
 * @since 0.4.0
 * @related relation.parent-sections, record.title
 */
export const ParentsSelector: FC<ICommonFormEleProps<IBasicSelect<ISectionElement>>> = memo(function ParentsSelector ({ formEle, element, handleChange }: ICommonFormEleProps<IBasicSelect<ISectionElement>>) {
  const [selectOptions, setSelectOptions] = useState<Array<OptionKeysModelGroup>>([])

  const [touched, setTouched] = useState(false)
  const { current: fieldId } = useRef(uniqueId(formEle.fieldName))
  const [isValid, setIsValidForField] = useValidators(fieldId)

  useEffect(() => {
    const getSelectOptions = async () => {
      const options = await Bucket.general.get(ProjectAtoms.currentProject)?.getOptionsForParentsSelector(formEle.options)

      if (options) {
        setSelectOptions(options)
      }
    }

    getSelectOptions()
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
      <FormElementLabel
        label={formEle.label!}
        required={!!formEle.required}
        labelHint={formEle.labelHint}
      />
      <Select
        defaultValue={ParentElement.infoStringToObjForOptionsGroup(element[formEle.fieldName], selectOptions as any)}
        isMulti={true}
        name={formEle.fieldName}
        options={selectOptions as any}
        styles={formSelectStyles(!isValid && touched)}
        onChange={handleChangeInParentsSelector}
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
}, (prevProps, nextProps) => (
  prevProps.element[prevProps.formEle.fieldName] === nextProps.element[nextProps.formEle.fieldName] &&
  prevProps.formEle.options === nextProps.formEle.options
))
