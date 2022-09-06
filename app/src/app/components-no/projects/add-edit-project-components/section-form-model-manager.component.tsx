import { URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { PROJECT_EDITOR_FORM_BUILDER } from 'app/data/project-form-builder/project-editor-form-builder.const'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { ISection } from 'app/models/section/section.declarations'
import {
  IUpdateFormProjectUpdateFormModelAddOptionPayload,
  IUpdateFormProjectUpdateFormModelDeleteOptionPayload,
  IUpdateFormProjectUpdateFormModelOfSectionPayload,
  IUpdateFormProjectUpdateFormModelOptionValuePayload
} from 'app/libs/redux/action.type'
import { AnitaStore } from 'app/libs/redux/reducers.const'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { storeDispatcher } from 'app/libs/redux/store-dispatcher.function'
import { SectionElement } from 'app/models/section-element/section-element.class'
import { EDITOR_MODE } from 'app/components-no/editor-mode.enum'
import { FormAutomator } from 'app/components-no/shared-components/forms-automator/form-automator.component'
import {
  FormAutomatorOnChangeValue,
  FormFieldsModel,
  IOptionKeysModel,
  TSupportedFormsTypes
} from 'app/components-no/shared-components/forms-automator/form-automator.types'
import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'

interface ISectionFormModelManagerProps {
  indexSection: number
  indexFormElement: number
  element: FormFieldsModel<TSupportedFormsTypes>
}

const getAlreadyExists = (section: ISection, fieldName: string): boolean => {
  if (!fieldName || !section) return false
  return section.formModel.some(formElement => formElement.fieldName === fieldName)
}

export const SectionFormModelManager: React.FC<ISectionFormModelManagerProps> = (props) => {
  const { indexSection, indexFormElement, element } = props

  const params = useParams()
  const projectEditorMode = useSelector((store: AnitaStore) => store.formProject.mode)
  const section = useSelector((state: AnitaStore) => state.formProject.original[RESERVED_AUDS_KEYS._sections]![indexSection])
  const projectId = params[URL_PARAMS.projectId]
  const mode = useMemo(() => projectId ? EDITOR_MODE.edit : EDITOR_MODE.add, [projectId])
  const alreadyExists = getAlreadyExists(section, element.fieldName)
  const formModelToUse = useMemo(() => mode === EDITOR_MODE.edit && alreadyExists
    ? PROJECT_EDITOR_FORM_BUILDER[projectEditorMode].sectionEles.existingItem
    : PROJECT_EDITOR_FORM_BUILDER[projectEditorMode].sectionEles.newItem,
  [alreadyExists, mode, projectEditorMode]
  )

  const handleChange = (indexSection: number, indexFormElement: number, fieldName: string | number, value: FormAutomatorOnChangeValue) => {
    const identifierAutoVal: string | null = fieldName === 'label' && !alreadyExists ? SectionElement.autoGenerateFieldName(value!) : null
    storeDispatcher({
      type: REDUX_ACTIONS.updateFormProjectUpdateFormModelOfSection,
      payload: {
        indexSection,
        indexFormElement,
        identifierAutoVal,
        fieldName,
        value
      } as IUpdateFormProjectUpdateFormModelOfSectionPayload
    })
  }

  const handleOptionsChange = (indexSection: number, indexFormElement: number, indexOptions: number, optionElement: IOptionKeysModel, fieldName: string | number, value: FormAutomatorOnChangeValue) => {
    storeDispatcher({
      type: REDUX_ACTIONS.updateFormProjectUpdateFormModelOptionValue,
      payload: {
        indexSection,
        indexFormElement,
        indexOptions,
        formElement: { ...optionElement, [fieldName]: value }
      } as IUpdateFormProjectUpdateFormModelOptionValuePayload
    })
  }

  const handleClickAddOption = (indexSection: number, indexFormElement: number) => {
    storeDispatcher({
      type: REDUX_ACTIONS.updateFormProjectUpdateFormModelAddOption,
      payload: {
        indexSection,
        indexFormElement
      } as IUpdateFormProjectUpdateFormModelAddOptionPayload
    })
  }

  const handleClickDeleteOption = (indexSection: number, indexFormElement: number, indexOptions: number) => {
    storeDispatcher({
      type: REDUX_ACTIONS.updateFormProjectUpdateFormModelDeleteOption,
      payload: {
        indexSection,
        indexFormElement,
        indexOptions
      } as IUpdateFormProjectUpdateFormModelDeleteOptionPayload
    })
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
