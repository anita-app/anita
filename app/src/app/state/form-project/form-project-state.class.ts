import { Bucket } from 'app/state/bucket.state'
import { FormProjectAtoms } from 'app/state/form-project/form-project.atoms'
import { PROJECT_EDITOR_MODE } from 'app/data/project-form-builder/project-editor-form-builder.const'
import { IProjectSettings, RESERVED_AUDS_KEYS, TSystemData } from 'app/models/project/project.declarations'
import { IdCreator } from 'app/libs/id-creator/id-creator.class'
import { FormFieldsModel, IBasicSelect, IOptionKeysModel, TSupportedFormsTypes } from 'app/components/shared-components/forms-automator/form-automator.types'
import { ISection, ISectionCustomFieldProperties } from 'app/models/section/section.declarations'
import cloneDeep from 'lodash.clonedeep'

export class FormProjectState {
  public static toggleProjectEditorMode = () => {
    const current = Bucket.general.get(FormProjectAtoms.mode)
    Bucket.general.set(
      FormProjectAtoms.mode,
      current === PROJECT_EDITOR_MODE.basic ? PROJECT_EDITOR_MODE.advanced : PROJECT_EDITOR_MODE.basic
    )
  }

  public static setFormProject = (systemData: TSystemData) => {
    Bucket.general.set(FormProjectAtoms.original, cloneDeep(systemData))
    Bucket.general.set(FormProjectAtoms.project, cloneDeep(systemData))
  }

  public static updateProjectSettings = (fieldName: keyof IProjectSettings, value: IProjectSettings[keyof IProjectSettings]) => {
    const currentProject = Bucket.general.get(FormProjectAtoms.project)
    const currentSettings = currentProject[RESERVED_AUDS_KEYS._settings] ?? []
    const currentSettingsValue = currentSettings[0] ?? ({} as IProjectSettings)
    const nextSettings = [{ ...currentSettingsValue, [fieldName]: value }]
    Bucket.general.set(FormProjectAtoms.project, {
      ...currentProject,
      [RESERVED_AUDS_KEYS._settings]: nextSettings
    })
  }

  public static addSection = () => {
    const currentProject = Bucket.general.get(FormProjectAtoms.project)
    const currentSections = currentProject[RESERVED_AUDS_KEYS._sections] ?? []
    const nextSections = currentSections.concat({
      id: IdCreator.random(),
      title: '',
      formModel: [{} as any],
      createdAt: ''
    })
    Bucket.general.set(FormProjectAtoms.project, {
      ...currentProject,
      [RESERVED_AUDS_KEYS._sections]: nextSections
    })
  }

  public static updateSection = (index: number, fieldName: keyof ISection, value: ISection[keyof ISection]) => {
    const currentProject = Bucket.general.get(FormProjectAtoms.project)
    const currentSections = currentProject[RESERVED_AUDS_KEYS._sections] ?? []
    const currentSection = currentSections[index]
    if (!currentSection) {
      return
    }

    const nextSections = currentSections.slice()
    nextSections[index] = { ...currentSection, [fieldName]: value }
    Bucket.general.set(FormProjectAtoms.project, {
      ...currentProject,
      [RESERVED_AUDS_KEYS._sections]: nextSections
    })
  }

  public static updateFormModelOfSection = (
    indexSection: number,
    indexFormElement: number,
    fieldName: keyof FormFieldsModel<TSupportedFormsTypes>,
    value: FormFieldsModel<TSupportedFormsTypes>[keyof FormFieldsModel<TSupportedFormsTypes>],
    identifierAutoVal: string | null
  ) => {
    const currentProject = Bucket.general.get(FormProjectAtoms.project)
    const currentSections = currentProject[RESERVED_AUDS_KEYS._sections] ?? []
    const currentSection = currentSections[indexSection]
    if (!currentSection) {
      return
    }

    const nextSections = currentSections.slice()
    const nextSection = { ...currentSection }
    const nextFormModel = nextSection.formModel.slice()
    const elementReference = nextFormModel[indexFormElement] as unknown as ISectionCustomFieldProperties
    const newElement = { ...elementReference, [fieldName]: value }
    if (identifierAutoVal) {
      newElement.fieldName = identifierAutoVal
    }
    nextFormModel[indexFormElement] = newElement as unknown as FormFieldsModel<TSupportedFormsTypes>
    nextSection.formModel = nextFormModel
    nextSections[indexSection] = nextSection

    Bucket.general.set(FormProjectAtoms.project, {
      ...currentProject,
      [RESERVED_AUDS_KEYS._sections]: nextSections
    })
  }

  public static addFieldToSection = (sectionIndex: number) => {
    const currentProject = Bucket.general.get(FormProjectAtoms.project)
    const currentSections = currentProject[RESERVED_AUDS_KEYS._sections] ?? []
    const currentSection = currentSections[sectionIndex]
    if (!currentSection) {
      return
    }

    const nextSections = currentSections.slice()
    nextSections[sectionIndex] = {
      ...currentSection,
      formModel: currentSection.formModel.concat({} as any)
    }
    Bucket.general.set(FormProjectAtoms.project, {
      ...currentProject,
      [RESERVED_AUDS_KEYS._sections]: nextSections
    })
  }

  public static removeFieldFromSection = (sectionIndex: number, fieldIndex: number) => {
    const currentProject = Bucket.general.get(FormProjectAtoms.project)
    const currentSections = currentProject[RESERVED_AUDS_KEYS._sections] ?? []
    const currentSection = currentSections[sectionIndex]
    if (!currentSection) {
      return
    }

    const nextSections = currentSections.slice()
    const nextFormModel = currentSection.formModel.slice()
    nextFormModel.splice(fieldIndex, 1)
    nextSections[sectionIndex] = {
      ...currentSection,
      formModel: nextFormModel
    }
    Bucket.general.set(FormProjectAtoms.project, {
      ...currentProject,
      [RESERVED_AUDS_KEYS._sections]: nextSections
    })
  }

  public static removeSection = (sectionIndex: number) => {
    const currentProject = Bucket.general.get(FormProjectAtoms.project)
    const currentSections = currentProject[RESERVED_AUDS_KEYS._sections] ?? []
    const nextSections = currentSections.slice()
    nextSections.splice(sectionIndex, 1)
    Bucket.general.set(FormProjectAtoms.project, {
      ...currentProject,
      [RESERVED_AUDS_KEYS._sections]: nextSections
    })
  }

  public static addOptionToFormModel = (indexSection: number, indexFormElement: number) => {
    const currentProject = Bucket.general.get(FormProjectAtoms.project)
    const currentSections = currentProject[RESERVED_AUDS_KEYS._sections] ?? []
    const currentSection = currentSections[indexSection]
    if (!currentSection) {
      return
    }

    const nextSections = currentSections.slice()
    const nextSection = { ...currentSection }
    const nextFormModel = nextSection.formModel.slice()
    const formEle = { ...(nextFormModel[indexFormElement] as IBasicSelect<TSupportedFormsTypes>) }
    const nextOptions = formEle.options ? formEle.options.slice() : []
    const defaultValue = nextOptions.length + 1
    nextOptions.push({ label: '', value: defaultValue } as IOptionKeysModel)
    formEle.options = nextOptions
    nextFormModel[indexFormElement] = formEle as FormFieldsModel<TSupportedFormsTypes>
    nextSection.formModel = nextFormModel
    nextSections[indexSection] = nextSection

    Bucket.general.set(FormProjectAtoms.project, {
      ...currentProject,
      [RESERVED_AUDS_KEYS._sections]: nextSections
    })
  }

  public static deleteOptionFromFormModel = (indexSection: number, indexFormElement: number, indexOptions: number) => {
    const currentProject = Bucket.general.get(FormProjectAtoms.project)
    const currentSections = currentProject[RESERVED_AUDS_KEYS._sections] ?? []
    const currentSection = currentSections[indexSection]
    if (!currentSection) {
      return
    }

    const nextSections = currentSections.slice()
    const nextSection = { ...currentSection }
    const nextFormModel = nextSection.formModel.slice()
    const formEle = { ...(nextFormModel[indexFormElement] as IBasicSelect<TSupportedFormsTypes>) }
    const nextOptions = formEle.options ? formEle.options.slice() : []
    nextOptions.splice(indexOptions, 1)
    formEle.options = nextOptions
    nextFormModel[indexFormElement] = formEle as FormFieldsModel<TSupportedFormsTypes>
    nextSection.formModel = nextFormModel
    nextSections[indexSection] = nextSection

    Bucket.general.set(FormProjectAtoms.project, {
      ...currentProject,
      [RESERVED_AUDS_KEYS._sections]: nextSections
    })
  }

  public static updateOptionValue = (
    indexSection: number,
    indexFormElement: number,
    indexOptions: number,
    formElement: IOptionKeysModel
  ) => {
    const currentProject = Bucket.general.get(FormProjectAtoms.project)
    const currentSections = currentProject[RESERVED_AUDS_KEYS._sections] ?? []
    const currentSection = currentSections[indexSection]
    if (!currentSection) {
      return
    }

    const nextSections = currentSections.slice()
    const nextSection = { ...currentSection }
    const nextFormModel = nextSection.formModel.slice()
    const formEle = { ...(nextFormModel[indexFormElement] as IBasicSelect<TSupportedFormsTypes>) }
    const nextOptions = formEle.options ? formEle.options.slice() : []
    nextOptions[indexOptions] = formElement
    formEle.options = nextOptions
    nextFormModel[indexFormElement] = formEle as FormFieldsModel<TSupportedFormsTypes>
    nextSection.formModel = nextFormModel
    nextSections[indexSection] = nextSection

    Bucket.general.set(FormProjectAtoms.project, {
      ...currentProject,
      [RESERVED_AUDS_KEYS._sections]: nextSections
    })
  }
}
