import { URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { PROJECT_EDITOR_FORM_BUILDER } from 'app/data/project-form-builder/project-editor-form-builder.const'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { ISection } from 'app/models/section/section.declarations'
import { SectionElement } from 'app/models/section-element/section-element.class'
import { EDITOR_MODE } from 'app/components/editor-mode.enum'
import { FormAutomator } from 'app/components/shared-components/forms-automator/form-automator.component'
import {
  FormAutomatorOnChangeValue,
  FormFieldsModel,
  IOptionKeysModel,
  TSupportedFormsTypes
} from 'app/components/shared-components/forms-automator/form-automator.types'
import React, { useMemo } from 'react'
import { useParams } from 'react-router'
import { useAtomValue } from 'jotai'
import { FormProjectAtoms } from 'app/state/form-project/form-project.atoms'
import { FormProjectState } from 'app/state/form-project/form-project-state.class'

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

export const SectionFormModelManager: React.FC<ISectionFormModelManagerProps> = (props) => {
  const { indexSection, indexFormElement, element } = props

  const params = useParams()
  const projectEditorMode = useAtomValue(FormProjectAtoms.mode)
  const originalProject = useAtomValue(FormProjectAtoms.original)
  const section = originalProject[RESERVED_AUDS_KEYS._sections]![indexSection]
  const projectId = params[URL_PARAMS.projectId]
  const mode = useMemo(() => projectId ? EDITOR_MODE.edit : EDITOR_MODE.add, [projectId])
  const alreadyExists = getAlreadyExists(section, element.fieldName)
  const formModelToUse = useMemo(() => mode === EDITOR_MODE.edit && alreadyExists
    ? PROJECT_EDITOR_FORM_BUILDER[projectEditorMode].sectionEles.existingItem
    : PROJECT_EDITOR_FORM_BUILDER[projectEditorMode].sectionEles.newItem,
  [alreadyExists, mode, projectEditorMode]
  )

  const handleChange = (indexSection: number, indexFormElement: number, fieldName: string | number, value: FormAutomatorOnChangeValue) => {
    const identifierAutoVal: string | null = fieldName === 'label' && !alreadyExists ? SectionElement.autoGenerateFieldName(section, value!) : null
    FormProjectState.updateFormModelOfSection(
      indexSection,
      indexFormElement,
      fieldName as keyof FormFieldsModel<TSupportedFormsTypes>,
      value as FormFieldsModel<TSupportedFormsTypes>[keyof FormFieldsModel<TSupportedFormsTypes>],
      identifierAutoVal
    )
  }

  const handleOptionsChange = (indexSection: number, indexFormElement: number, indexOptions: number, optionElement: IOptionKeysModel, fieldName: string | number, value: FormAutomatorOnChangeValue) => {
    FormProjectState.updateOptionValue(
      indexSection,
      indexFormElement,
      indexOptions,
      { ...optionElement, [fieldName]: value }
    )
  }

  const handleClickAddOption = (indexSection: number, indexFormElement: number) => {
    FormProjectState.addOptionToFormModel(indexSection, indexFormElement)
  }

  const handleClickDeleteOption = (indexSection: number, indexFormElement: number, indexOptions: number) => {
    FormProjectState.deleteOptionFromFormModel(indexSection, indexFormElement, indexOptions)
  }

  return (
    <FormAutomator
      {
      ...{
        ...props,
        formModel: formModelToUse as Array<FormFieldsModel<any>>,
        handleChange: handleChange.bind(undefined, indexSection, indexFormElement),
        handleOptionsChange: handleOptionsChange.bind(undefined, indexSection, indexFormElement),
        handleClickAddOption: handleClickAddOption.bind(undefined, indexSection, indexFormElement),
        handleClickDeleteOption: handleClickDeleteOption.bind(undefined, indexSection, indexFormElement)
      }
      }
    />
  )
}
