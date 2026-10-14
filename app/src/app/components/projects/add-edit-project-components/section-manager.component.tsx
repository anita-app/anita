import { PROJECT_EDITOR_FORM_BUILDER } from 'app/data/project-form-builder/project-editor-form-builder.const'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { RESERVED_FIELDS } from 'app/models/reserved-fields.constant'
import { SectionFormModelManager } from 'app/components/projects/add-edit-project-components/section-form-model-manager.component'
import { FormAutomator } from 'app/components/shared-components/forms-automator/form-automator.component'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { useAtomValue } from 'jotai'
import { FormProjectAtoms } from 'app/state/form-project/form-project.atoms'
import { FormProjectState } from 'app/state/form-project/form-project-state.class'
import type { FC } from 'react'
import type { FormFieldsModel } from 'app/components/shared-components/forms-automator/form-automator.types'
import type { ISection } from 'app/models/section/section.declarations'

interface ISectionManagerProps {
  section: ISection
  sectionIndex: number
}

export const SectionManager: FC<ISectionManagerProps> = (props) => {
  const projectEditorMode = useAtomValue(FormProjectAtoms.mode)
  const project = useAtomValue(FormProjectAtoms.project)
  const sections = project[RESERVED_AUDS_KEYS._sections]
  const customFields: Array<string | null> = props.section.formModel
    .map(formElement => Object.values(RESERVED_FIELDS).includes(formElement.fieldName) ? null : formElement.fieldName)
    .filter(fieldName => fieldName !== null)

  const handleChange = (index: number, fieldName: keyof ISection, value: ISection[keyof ISection]) => {
    FormProjectState.updateSection(index, fieldName, value)
  }

  const handleClickAddField = () => {
    FormProjectState.addFieldToSection(props.sectionIndex)
  }

  const handleClickDeleteSection = () => {
    FormProjectState.removeSection(props.sectionIndex)
  }

  const handleClickDeleteField = (fieldIndex: number) => {
    FormProjectState.removeFieldFromSection(props.sectionIndex, fieldIndex)
  }

  return (
    <div className="ui-card mt-5 p-4 md:px-5">
      <div>
        <p className="ui-eyebrow">{`Section ${props.sectionIndex + 1}`}</p>
        <h3 className="ui-title text-lg">{props.section.title || 'New section'}</h3>
        <hr className="ui-divider mt-4" />
      </div>
      <div className="pt-4">
        <FormAutomator
          formModel={PROJECT_EDITOR_FORM_BUILDER[projectEditorMode].sectionInfo as Array<FormFieldsModel<any>>}
          element={props.section}
          handleChange={handleChange.bind(undefined, props.sectionIndex)}
          sectionId={props.section.id}
        />
      </div>
      <h4 className="ui-field-label pl-2 mb-2 mt-6">Section element fields</h4>
      {props.section.formModel.map((formElement, indexFormElement) => !customFields.includes(formElement.fieldName)
        ? null
        : (
          <div
            key={`${props.section.id}-${indexFormElement}`}
            className="rounded-xl border border-[#e6ecf3] bg-[#fbfcfe] hover:border-[#b9d3f2] hover:shadow-[0_0_0_3px_rgba(45,150,255,0.08)] transition mb-3 p-4"
          >
            <SectionFormModelManager
              indexFormElement={indexFormElement}
              indexSection={props.sectionIndex}
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
          ),
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
