import { RESERVED_AUDS_KEYS, SectionElement } from 'app/data/project-structure/project-info'
import { parentInfoObjToString } from 'app/libs/project-helpers/parent-info-form-ele-builder/parent-info-obj-to-string.function'
import { Option, parentInfoStringToObj } from 'app/libs/project-helpers/parent-info-form-ele-builder/parent-info-string-to-obj.function'
import { AnitaStore } from 'app/libs/redux/reducers.const'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { storeDispatcher } from 'app/libs/redux/store-dispatcher.function'
import { IBasicSelect, ICommonFormEleProps } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types'
import { FormEleContainer } from 'app/ui-react-components/shared-components/forms-automator/form-layout/form-ele-container.component'
import { FormElementLabel } from 'app/ui-react-components/shared-components/forms-automator/form-layout/form-element-label.component'
import { useValidators } from 'app/ui-react-components/shared-components/forms-automator/hooks/use-validators.hook'
import { ValidatorsContainer } from 'app/ui-react-components/shared-components/forms-automator/validators/validators-container.component'
import uniqueId from 'lodash/uniqueId'
import {
  memo,
  useEffect,
  useRef,
  useState
  } from 'react'
import { useSelector } from 'react-redux'
import Select, { MultiValue } from 'react-select'

export const ChildOfSelectorForSection = memo(function ChildOfSelectorForSection({ formEle, element, handleChange, sectionId }: ICommonFormEleProps<IBasicSelect<SectionElement>>) {

  const currentEditedProjectSections = useSelector((state: AnitaStore) => state.formProject.project[RESERVED_AUDS_KEYS._sections]);
  const [selectOptions, setSelectOptions] = useState<Array<Option>>([]);

  const [touched, setTouched] = useState(false);
  const { current: fieldId } = useRef(uniqueId(formEle.fieldName))
  const isInValid = useValidators(fieldId)

  useEffect(() => {
    return () => {
      storeDispatcher({ type: REDUX_ACTIONS.unsetValidStateForEle, payload: fieldId });
    }
  }, [fieldId]);

  useEffect(() => {
    let isMounted = true;

    const buildOptions = () => {

      if (!Array.isArray(currentEditedProjectSections))
        return;

      const selectableSections: Array<Option> = [];
      currentEditedProjectSections.forEach(sectionDec => {
        if (sectionDec.id !== sectionId)
          selectableSections.push({
            value: sectionDec.id,
            label: sectionDec.title
          });
      });
      setSelectOptions(selectableSections);
    }

    if (isMounted)
      buildOptions();

    return () => { isMounted = false };
  }, [currentEditedProjectSections, currentEditedProjectSections.length, sectionId]);

  const handleChangeInChildOfSelectorForSection = (newValue: MultiValue<Option>) => {
    handleChange(formEle.fieldName, parentInfoObjToString(newValue as Array<Option>));
  }

  if (selectOptions.length === 0)
    return null;

  // We uas as any because react-select does not export the values we'd like to use,
  // and the ones we define are not compatible.
  return (<FormEleContainer width="w-full">
    <FormElementLabel label={formEle['label']} />
    <Select
      defaultValue={parentInfoStringToObj(element[formEle.fieldName], selectOptions as any)}
      isMulti
      name={formEle.fieldName}
      options={selectOptions as any}
      className={isInValid && touched ? "border border-red-600 rounded" : ""}
      onChange={handleChangeInChildOfSelectorForSection}
      onBlur={() => setTouched(true)}
    />
    <ValidatorsContainer formEle={formEle} element={element} fieldId={fieldId} touched={touched} />
  </FormEleContainer>
  )
}, (prevProps, nextProps) => {
  return prevProps.element[prevProps.formEle.fieldName] === nextProps.element[nextProps.formEle.fieldName]
});