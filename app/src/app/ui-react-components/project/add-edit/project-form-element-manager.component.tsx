import { RESERVED_AUDS_KEYS } from 'app/data/project-structure/project-info'
import { ParentInfoFormEleBuilder } from 'app/libs/project-helpers/parent-info-form-ele-builder/parent-info-form-ele-builder.class'
import { AnitaStore } from 'app/libs/redux/reducers.const'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { storeDispatcher } from 'app/libs/redux/store-dispatcher.function'
import { findSectionById } from 'app/libs/tools/find-section-by-id.function'
import { FormAutomator } from 'app/ui-react-components/shared-components/forms-automator/form-automator.component'
import { FormAutomatorOnChangeValue } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types'
import { useSelector } from 'react-redux'

export const ProjectFormElementManager = ({ sectionId }: { sectionId: string }) => {

  const project = useSelector((state: AnitaStore) => state.project);
  const sections = project[RESERVED_AUDS_KEYS._sections];
  const section = findSectionById(sections, sectionId);

  const element = useSelector((store: AnitaStore) => store.formElement.element);

  const handleChange = (fieldName: string | number, value: FormAutomatorOnChangeValue) => {
    storeDispatcher({ type: REDUX_ACTIONS.updateFormElementKey, payload: { fieldName, value } });
  }

  return (
    <form name="element-form">
      {section.childOf && section.childOf.length > 0 && <FormAutomator
        formModel={[new ParentInfoFormEleBuilder(section.childOf, sections).build()]}
        element={element}
        handleChange={handleChange} />
      }
      <FormAutomator formModel={section.formModel} element={element} handleChange={handleChange} />
    </form>
  )

};