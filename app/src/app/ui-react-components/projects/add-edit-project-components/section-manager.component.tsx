import { PROJECT_EDITOR_FORM_BUILDER } from 'app/data/project-form-builder/project-editor-form-builder.const';
import { RESERVED_AUDS_KEYS, Section } from 'app/data/project-structure/project-info';
import { RESERVED_FIELDS } from 'app/data/project-structure/reserved-fields.constant';
import { IUpdateFormProjectRemoveFieldFromSectionPayload, IUpdateFormProjectUpdateSectionPayload } from 'app/libs/redux/action.type';
import { AnitaStore } from 'app/libs/redux/reducers.const';
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const';
import { store } from 'app/libs/redux/state.store';
import { SectionFormModelManager } from 'app/ui-react-components/projects/add-edit-project-components/section-form-model-manager.component';
import { DANGER_BTN_OUTLINE, SUCCESS_BTN_OUTLINE } from 'app/ui-react-components/shared-components/buttons/buttons-layout-tw-classes.const';
import { FormAutomator } from 'app/ui-react-components/shared-components/forms-automator/form-automator.component';
import { FormAutomatorOnChangeValue, FormFieldsModel } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types';
import { useSelector } from 'react-redux';

export const SectionManager = ({ section, sectionIndex }: { section: Section, sectionIndex: number }) => {

  const projectEditorMode = useSelector((store: AnitaStore) => store.formProject.mode);
  const sections = useSelector((store: AnitaStore) => store.formProject.project[RESERVED_AUDS_KEYS._sections]);
  const customFields: Array<string> = section.formModel
    .map(formElement => Object.values(RESERVED_FIELDS).includes(formElement.fieldName) ? null : formElement.fieldName)
    .filter(fieldName => fieldName !== null);

  const handleChange = (index: number, fieldName: string | number, value: FormAutomatorOnChangeValue) => {
    store.dispatch({
      type: REDUX_ACTIONS.updateFormProjectUpdateSection, payload: {
        section: { ...section, [fieldName]: value },
        index
      } as IUpdateFormProjectUpdateSectionPayload
    });
  }

  const handleClickAddField = () => {
    store.dispatch({ type: REDUX_ACTIONS.updateFormProjectAddFieldToSection, payload: sectionIndex });
  }

  const handleClickDeleteSection = () => {
    store.dispatch({ type: REDUX_ACTIONS.updateFormProjectRemoveSection, payload: sectionIndex });
  }

  const handleClickDeleteField = (fieldIndex: number) => {
    store.dispatch({ type: REDUX_ACTIONS.updateFormProjectRemoveFieldFromSection, payload: { sectionIndex, fieldIndex } as IUpdateFormProjectRemoveFieldFromSectionPayload });
  }

  return (
    <div className="mt-5 p-4 bg-white rounded shadow">
      <div>
        <h3 className="text-md font-bold">{`Section # ${sectionIndex + 1}`}</h3>
        <hr className="mt-4" />
      </div>
      <div className="pt-4">
        <FormAutomator
          formModel={PROJECT_EDITOR_FORM_BUILDER[projectEditorMode].sectionInfo as Array<FormFieldsModel<any>>}
          element={section}
          handleChange={handleChange.bind(undefined, sectionIndex)}
          sectionId={section.id}
        />
      </div>
      <h4 className="pl-2 font-bold mb-2 mt-6">Section element fields</h4>
      {section.formModel.map((formElement, indexFormElement) =>
        !customFields.includes(formElement.fieldName) ? null : (
          <div key={`${section.id}-${indexFormElement}`} className="border border-transparent hover:border-prussian-blue-500 shadow rounded mb-3 p-4">
            <SectionFormModelManager
              indexFormElement={indexFormElement}
              indexSection={sectionIndex}
              element={formElement}
            />
            {customFields.length < 2 ? null : (
              <div className="flex justify-end">
                <button
                  onClick={handleClickDeleteField.bind(undefined, indexFormElement)}
                  className={`text-sm py-1 px-3 ${DANGER_BTN_OUTLINE}`}>
                  Delete field
                </button>
              </div>
            )}
          </div>
        )
      )}
      <div className="flex items-end mt-10 mb-1">
        {(sections.length > 1) && <button onClick={handleClickDeleteSection}
          className={`py-2 px-4 text-sm ${DANGER_BTN_OUTLINE}`}>
          Delete section
        </button>}
        <button onClick={handleClickAddField}
          className={`ml-auto py-2 px-4 text-sm ${SUCCESS_BTN_OUTLINE}`}>
          Add field
        </button>
      </div>
    </div>
  )

}