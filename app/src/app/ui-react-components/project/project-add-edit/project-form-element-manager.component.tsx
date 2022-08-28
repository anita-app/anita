import { Manager } from 'app/libs/Manager/Manager.class'
import { AnitaStore } from 'app/libs/redux/reducers.const'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { storeDispatcher } from 'app/libs/redux/store-dispatcher.function'
import { FormAutomator } from 'app/ui-react-components/shared-components/forms-automator/form-automator.component'
import { FormAutomatorOnChangeValue } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types'
import { useSelector } from 'react-redux'

interface IProjectFormElementManagerProps {
  sectionId: string
}

export const ProjectFormElementManager: React.FC<IProjectFormElementManagerProps> = ({ sectionId }) => {

  const project = Manager.getCurrentProject()
  const section = project.getSectionById(sectionId);

  const element = useSelector((store: AnitaStore) => store.formElement.element);

  const handleChange = (fieldName: string | number, value: FormAutomatorOnChangeValue) => {
    storeDispatcher({ type: REDUX_ACTIONS.updateFormElementKey, payload: { fieldName, value } });
  }

  return (
    <form name="element-form">
      {section.childOf && section.childOf.length > 0 && <FormAutomator
        formModel={[section.getParentInfoFormEle()]}
        element={element}
        handleChange={handleChange} />
      }
      <FormAutomator formModel={section.formModel} element={element} handleChange={handleChange} />
    </form>
  )

};