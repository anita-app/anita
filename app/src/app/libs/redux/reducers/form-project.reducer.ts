import { PROJECT_EDITOR_MODE } from 'app/data/project-form-builder/project-editor-form-builder.const'
import { RESERVED_AUDS_KEYS, TSystemData } from 'app/models/project/project.declarations'
import { IdCreator } from 'app/libs/id-creator/id-creator.class'
import { Action } from 'app/libs/redux/action.type'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { FormFieldsModel, IBasicSelect, IOptionKeysModel, TSupportedFormsTypes } from 'app/components/shared-components/forms-automator/form-automator.types'
import cloneDeep from 'lodash.clonedeep'
import { ISectionCustomFieldProperties } from 'app/models/section/section.declarations'

export interface IFormProjectState {
  original: Partial<TSystemData>
  project: Partial<TSystemData>
  mode: PROJECT_EDITOR_MODE
}

/**
 * The initial state of the container of the current project
 */
const formElementState: IFormProjectState = {
  original: {
    [RESERVED_AUDS_KEYS._settings]: [],
    [RESERVED_AUDS_KEYS._sections]: []
  },
  project: {
    [RESERVED_AUDS_KEYS._settings]: [],
    [RESERVED_AUDS_KEYS._sections]: []
  },
  mode: PROJECT_EDITOR_MODE.basic
}

/**
 * Updates the projectState
 */
export const formProjectReducer = (state: IFormProjectState = formElementState, action: Action<REDUX_ACTIONS>): IFormProjectState => {
  switch (action.type) {
    case REDUX_ACTIONS.setProjectEditorMode:
      return {
        original: state.original,
        project: state.project,
        mode: state.mode === PROJECT_EDITOR_MODE.basic ? PROJECT_EDITOR_MODE.advanced : PROJECT_EDITOR_MODE.basic
      }
    case REDUX_ACTIONS.setFormProject:
      // Here we need:
      // - a deep copy of the project to leave the source unchanged in case the user cancel the edits, and
      // - to "unlink" the Object set on the `project` key from the one set on the `original` key.
      return { original: cloneDeep(action.payload), mode: state.mode, project: cloneDeep(action.payload) }
    case REDUX_ACTIONS.updateFormProjectSettings:
      return {
        original: state.original,
        mode: state.mode,
        project: {
          ...state.project,
          [RESERVED_AUDS_KEYS._settings]: [{ ...state.project[RESERVED_AUDS_KEYS._settings]![0], [action.payload.fieldName]: action.payload.value }]
        }
      }
    case REDUX_ACTIONS.updateFormProjectAddSection:
      return {
        original: state.original,
        mode: state.mode,
        project: {
          ...state.project,
          [RESERVED_AUDS_KEYS._sections]: state.project[RESERVED_AUDS_KEYS._sections]?.concat({
            id: IdCreator.random(),
            title: '',
            formModel: [{} as any],
            createdAt: ''
          })
        }
      }
    case REDUX_ACTIONS.updateFormProjectUpdateSection: {
      const stateCopy = { original: state.original, mode: state.mode, project: { ...state.project } }
      const originalSection = stateCopy.project[RESERVED_AUDS_KEYS._sections]![action.payload.index]
      stateCopy.project[RESERVED_AUDS_KEYS._sections]![action.payload.index] = { ...originalSection, [action.payload.fieldName]: action.payload.value }
      return stateCopy
    } case REDUX_ACTIONS.updateFormProjectUpdateFormModelOfSection: {
      const stateCopy = { original: state.original, mode: state.mode, project: { ...state.project } }
      const elementReference = stateCopy.project[RESERVED_AUDS_KEYS._sections]![action.payload.indexSection].formModel[action.payload.indexFormElement] as unknown as ISectionCustomFieldProperties
      const newElement = { ...elementReference, [action.payload.fieldName]: action.payload.value }
      if (action.payload.identifierAutoVal) {
        newElement.fieldName = action.payload.identifierAutoVal
      }
      stateCopy.project[RESERVED_AUDS_KEYS._sections]![action.payload.indexSection].formModel[action.payload.indexFormElement] = newElement as unknown as FormFieldsModel<TSupportedFormsTypes>
      return stateCopy
    } case REDUX_ACTIONS.updateFormProjectAddFieldToSection: {
      const stateCopy = { original: state.original, mode: state.mode, project: { ...state.project } }
      stateCopy.project[RESERVED_AUDS_KEYS._sections]![action.payload].formModel.push({} as any)
      return stateCopy
    } case REDUX_ACTIONS.updateFormProjectRemoveFieldFromSection: {
      const stateCopy = { original: state.original, mode: state.mode, project: { ...state.project } }
      stateCopy.project[RESERVED_AUDS_KEYS._sections]![action.payload.sectionIndex].formModel.splice(action.payload.fieldIndex, 1)
      return stateCopy
    } case REDUX_ACTIONS.updateFormProjectRemoveSection: {
      const stateCopy = { original: state.original, mode: state.mode, project: { ...state.project } }
      stateCopy.project[RESERVED_AUDS_KEYS._sections]?.splice(action.payload, 1)
      return stateCopy
    } case REDUX_ACTIONS.updateFormProjectUpdateFormModelAddOption: {
      const stateCopy = { original: state.original, mode: state.mode, project: { ...state.project } }
      const formEle: IBasicSelect<TSupportedFormsTypes> = stateCopy.project[RESERVED_AUDS_KEYS._sections]![action.payload.indexSection].formModel[action.payload.indexFormElement] as IBasicSelect<TSupportedFormsTypes>
      const defaultValue = formEle.options.length + 1
      formEle.options.push({ label: '', value: defaultValue } as IOptionKeysModel)
      return stateCopy
    } case REDUX_ACTIONS.updateFormProjectUpdateFormModelDeleteOption: {
      const stateCopy = { original: state.original, mode: state.mode, project: { ...state.project } }
      const formEle: IBasicSelect<TSupportedFormsTypes> = stateCopy.project[RESERVED_AUDS_KEYS._sections]![action.payload.indexSection].formModel[action.payload.indexFormElement] as IBasicSelect<TSupportedFormsTypes>
      formEle.options.splice(action.payload.indexOptions, 1)
      return stateCopy
    } case REDUX_ACTIONS.updateFormProjectUpdateFormModelOptionValue: {
      const stateCopy = { original: state.original, mode: state.mode, project: { ...state.project } }
      const formEle: IBasicSelect<TSupportedFormsTypes> = stateCopy.project[RESERVED_AUDS_KEYS._sections]![action.payload.indexSection].formModel[action.payload.indexFormElement] as IBasicSelect<TSupportedFormsTypes>
      formEle.options[action.payload.indexOptions] = action.payload.formElement as IBasicSelect<TSupportedFormsTypes>
      return stateCopy
    } default:
      return state
  }
}
