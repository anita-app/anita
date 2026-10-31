import { URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { PROJECT_EDITOR_FORM_BUILDER } from 'app/data/project-form-builder/project-editor-form-builder.const'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { SectionElement } from 'app/models/section-element/section-element.class'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { FormAutomator } from 'app/components/shared-components/forms-automator/form-automator.component'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useAtomValue } from 'jotai'
import { FormProjectAtoms } from 'app/state/form-project/form-project.atoms'
import { FormProjectState } from 'app/state/form-project/form-project-state.class'
import type { FC } from 'react'
import type {
  FormAutomatorOnChangeValue,
  FormFieldsModel,
  IOptionKeysModel,
  TSupportedFormsTypes,
} from 'app/components/shared-components/forms-automator/form-automator.types'
import type { ISection } from 'app/models/section/section.declarations'

interface ISectionFormModelManagerProps {
  indexSection: number
  indexFormElement: number
  element: FormFieldsModel<TSupportedFormsTypes>
  forceFullWidth?: boolean
}

const getAlreadyExists = (section: ISection, fieldName: string): boolean => {
  if (!fieldName || !section) return false
  return section.formModel.some(formElement => formElement.fieldName === fieldName)
}

/**
 * @feature section.fields
 * @title Add fields to a section
 * @summary Defines the fields of the records of a section: their label, data type and whether they must be filled.
 * @where Project editor ("Add Project" / "Edit Project"), "Section element fields" of each section card, with the "Add field" and
 * "Delete field" buttons.
 * @usage 1. In a section card click "Add field".
 * 2. Type the "Field label".
 * 3. Choose the "Data type"; for text fields also the "Content type", for dates the "Date format", for date and time the
 * "Time format".
 * 4. For drop-down and alternative choice fields, type the "Choices".
 * 5. Tick "Required" if the field must always be filled.
 * 6. Save the project.
 * @options Data type: any field type of Anita (default: the first of the list). Content type of text fields (text, email,
 * number, phone, link, color...), date format, time format. "Required", off by default. "Identifier", only in Advanced
 * mode.
 * @rules The label is required. In basic mode the identifier is created from the label and kept unique in the section; once
 * the field is saved its identifier cannot be changed, while label, type and the other settings can. A new section
 * starts with one empty field; "Delete field" appears only when the section has more than one field.
 * @errors none
 * @status stable
 * @since 0.1.0
 * @related section.add, project.advanced-editor
 */
export const SectionFormModelManager: FC<ISectionFormModelManagerProps> = (props) => {
  const params = useParams()
  const projectEditorMode = useAtomValue(FormProjectAtoms.mode)
  const originalProject = useAtomValue(FormProjectAtoms.original)
  const section = originalProject[RESERVED_AUDS_KEYS._sections]![props.indexSection]
  const projectId = params[URL_PARAMS.projectId]
  const mode = useMemo(() => projectId ? EDITOR_MODE.edit : EDITOR_MODE.add, [projectId])
  const alreadyExists = getAlreadyExists(section, props.element.fieldName)
  const formModelToUse = useMemo(() => mode === EDITOR_MODE.edit && alreadyExists
    ? PROJECT_EDITOR_FORM_BUILDER[projectEditorMode].sectionEles.existingItem
    : PROJECT_EDITOR_FORM_BUILDER[projectEditorMode].sectionEles.newItem,
  [alreadyExists, mode, projectEditorMode],
  )

  const handleChange = (indexSection: number, indexFormElement: number, fieldName: string | number, value: FormAutomatorOnChangeValue) => {
    const identifierAutoVal: string | null = fieldName === 'label' && !alreadyExists ? SectionElement.autoGenerateFieldName(section, value!) : null
    FormProjectState.updateFormModelOfSection(
      indexSection,
      indexFormElement,
      fieldName as keyof FormFieldsModel<TSupportedFormsTypes>,
      value as FormFieldsModel<TSupportedFormsTypes>[keyof FormFieldsModel<TSupportedFormsTypes>],
      identifierAutoVal,
    )
  }

  const handleOptionsChange = (indexSection: number, indexFormElement: number, indexOptions: number, optionElement: IOptionKeysModel, fieldName: string | number, value: FormAutomatorOnChangeValue) => {
    FormProjectState.updateOptionValue(
      indexSection,
      indexFormElement,
      indexOptions,
      { ...optionElement, [fieldName]: value },
    )
  }

  const handleClickAddOption = (indexSection: number, indexFormElement: number) => {
    FormProjectState.addOptionToFormModel(indexSection, indexFormElement)
  }

  const handleClickDeleteOption = (indexSection: number, indexFormElement: number, indexOptions: number) => {
    FormProjectState.deleteOptionFromFormModel(indexSection, indexFormElement, indexOptions)
  }

  return (
    <FormAutomator {
      ...{
        ...props,
        formModel: formModelToUse as Array<FormFieldsModel<any>>,
        handleChange: handleChange.bind(undefined, props.indexSection, props.indexFormElement),
        handleOptionsChange: handleOptionsChange.bind(undefined, props.indexSection, props.indexFormElement),
        handleClickAddOption: handleClickAddOption.bind(undefined, props.indexSection, props.indexFormElement),
        handleClickDeleteOption: handleClickDeleteOption.bind(undefined, props.indexSection, props.indexFormElement),
      }
      }
    />
  )
}
