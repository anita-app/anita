import { PROJECT_EDITOR_FORM_BUILDER } from 'app/data/project-form-builder/project-editor-form-builder.const'
import { RESERVED_AUDS_KEYS } from 'app/models/project-n/project.declarations'
import { ISection } from 'app/models/section-n/section.declarations'
import { RESERVED_FIELDS } from 'app/models/reserved-fields.constant'
import { IUpdateFormProjectRemoveFieldFromSectionPayload } from 'app/libs/redux/action.type'
import { AnitaStore } from 'app/libs/redux/reducers.const'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { storeDispatcher } from 'app/libs/redux/store-dispatcher.function'
import { SectionFormModelManager } from 'app/components/projects/add-edit-project-components/section-form-model-manager.component'
import { FormAutomator } from 'app/components/shared-components/forms-automator/form-automator.component'
import { FormFieldsModel } from 'app/components/shared-components/forms-automator/form-automator.types'
import { useSelector } from 'react-redux'
import React from 'react'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'

interface ISectionManagerProps {
  section: ISection
  sectionIndex: number
}

export const SectionManager: React.FC<ISectionManagerProps> = ({ section, sectionIndex }) => {
  const projectEditorMode = useSelector((store: AnitaStore) => store.formProject.mode)
  const sections = useSelector((store: AnitaStore) => store.formProject.project[RESERVED_AUDS_KEYS._sections])
  const customFields: Array<string | null> = section.formModel
    .map(formElement => Object.values(RESERVED_FIELDS).includes(formElement.fieldName) ? null : formElement.fieldName)
    .filter(fieldName => fieldName !== null)

  const handleChange = (index: number, fieldName: keyof ISection, value: ISection[keyof ISection]) => {
    storeDispatcher({
      type: REDUX_ACTIONS.updateFormProjectUpdateSection, payload: { fieldName, value, index }
    })
  }

  const handleClickAddField = () => {
    storeDispatcher({ type: REDUX_ACTIONS.updateFormProjectAddFieldToSection, payload: sectionIndex })
  }

  const handleClickDeleteSection = () => {
    storeDispatcher({ type: REDUX_ACTIONS.updateFormProjectRemoveSection, payload: sectionIndex })
  }

  const handleClickDeleteField = (fieldIndex: number) => {
    storeDispatcher({ type: REDUX_ACTIONS.updateFormProjectRemoveFieldFromSection, payload: { sectionIndex, fieldIndex } as IUpdateFormProjectRemoveFieldFromSectionPayload })
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
      {section.formModel.map((formElement, indexFormElement) => !customFields.includes(formElement.fieldName)
        ? null
        : (
          <div key={`${section.id}-${indexFormElement}`} className="border border-transparent hover:border-prussian-blue-500 shadow rounded mb-3 p-4">
            <SectionFormModelManager
              indexFormElement={indexFormElement}
              indexSection={sectionIndex}
              element={formElement}
            />
            {customFields.length > 1 && (
              <div className="flex justify-end">
                <Button
                  id="deleteField"
                  label="Delete field"
                  type={Type.danger}
                  fill="outline"
                  size="sm"
                  onClick={handleClickDeleteField.bind(undefined, indexFormElement)}
                />
              </div>
            )}
          </div>
          )
      )}
      <div className={`flex ${sections?.length! > 1 ? 'justify-between' : 'justify-end'} mt-10 mb-1`}>
        {(sections?.length! > 1) && (
          <Button
            id="deleteSection"
            label="Delete section"
            type={Type.danger}
            fill="outline"
            onClick={handleClickDeleteSection}
          />
        )}
        <Button
          id="addField"
          label="Add field"
          type={Type.success}
          fill="outline"
          onClick={handleClickAddField}
        />
      </div>
    </div>
  )
}
