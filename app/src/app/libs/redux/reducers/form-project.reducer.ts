import { PROJECT_EDITOR_MODE } from 'app/data/project-form-builder/project-editor-form-builder.const'
import { RESERVED_AUDS_KEYS, SectionCustomFieldProperties, SystemData } from 'app/data/project-structure/project-info'
import { IdCreator } from 'app/libs/id-creator/id-creator.class'
import { Action } from 'app/libs/redux/action.type'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { FormFieldsModel, OptionKeysModel, SupportedFormsTypes } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types'
import cloneDeep from 'lodash.clonedeep'

export interface IFormProjectState {
  original: Partial<SystemData>;
  project: Partial<SystemData>;
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
      // Here we need a deep copy of the project to leave the source unchanged in case the user cancel the edits,
      // and to "unlink" the Object set on the `project` key from the one set on the `original` key.
      return { original: cloneDeep(action.payload), mode: state.mode, project: cloneDeep(action.payload) }
    case REDUX_ACTIONS.updateFormProjectSettings:
      return {
        original: state.original,
        mode: state.mode,
        project: {
          ...state.project,
          [RESERVED_AUDS_KEYS._settings]: [{ ...state.project[RESERVED_AUDS_KEYS._settings][0], [action.payload.fieldName]: action.payload.value }]
        }
      }
    case REDUX_ACTIONS.updateFormProjectAddSection:
      return {
        original: state.original,
        mode: state.mode,
        project: {
          ...state.project,
          [RESERVED_AUDS_KEYS._sections]: state.project[RESERVED_AUDS_KEYS._sections].concat({
            id: IdCreator.random(),
            title: '',
            formModel: [{} as any]
          })
        }
      }
    case REDUX_ACTIONS.updateFormProjectUpdateSection: {
      const stateCopy = { original: state.original, mode: state.mode, project: { ...state.project } }
      const originalSection = stateCopy.project[RESERVED_AUDS_KEYS._sections][action.payload.index]
      stateCopy.project[RESERVED_AUDS_KEYS._sections][action.payload.index] = { ...originalSection, [action.payload.fieldName]: action.payload.value }
      return stateCopy
    } case REDUX_ACTIONS.updateFormProjectUpdateFormModelOfSection: {
      const stateCopy = { original: state.original, mode: state.mode, project: { ...state.project } }
      const elementReference = stateCopy.project[RESERVED_AUDS_KEYS._sections][action.payload.indexSection].formModel[action.payload.indexFormElement] as unknown as SectionCustomFieldProperties
      const newElement = { ...elementReference, [action.payload.fieldName]: action.payload.value }
      if (action.payload.identifierAutoVal) {
        newElement.fieldName = action.payload.identifierAutoVal
      }
      stateCopy.project[RESERVED_AUDS_KEYS._sections][action.payload.indexSection].formModel[action.payload.indexFormElement] = newElement as unknown as FormFieldsModel<SupportedFormsTypes>
      return stateCopy
    } case REDUX_ACTIONS.updateFormProjectAddFieldToSection: {
      const stateCopy = { original: state.original, mode: state.mode, project: { ...state.project } }
      stateCopy.project[RESERVED_AUDS_KEYS._sections][action.payload].formModel.push({} as any)
      return stateCopy
    } case REDUX_ACTIONS.updateFormProjectRemoveFieldFromSection: {
      const stateCopy = { original: state.original, mode: state.mode, project: { ...state.project } }
      stateCopy.project[RESERVED_AUDS_KEYS._sections][action.payload.sectionIndex].formModel.splice(action.payload.fieldIndex, 1)
      return stateCopy
    } case REDUX_ACTIONS.updateFormProjectRemoveSection: {
      const stateCopy = { original: state.original, mode: state.mode, project: { ...state.project } }
      stateCopy.project[RESERVED_AUDS_KEYS._sections].splice(action.payload, 1)
      return stateCopy
    } case REDUX_ACTIONS.updateFormProjectUpdateFormModelAddOption: {
      const stateCopy = { original: state.original, mode: state.mode, project: { ...state.project } }
      const defaultValue = stateCopy.project[RESERVED_AUDS_KEYS._sections][action.payload.indexSection].formModel[action.payload.indexFormElement].options.length + 1
      stateCopy.project[RESERVED_AUDS_KEYS._sections][action.payload.indexSection].formModel[action.payload.indexFormElement].options.push({ label: '', value: defaultValue } as OptionKeysModel)
      return stateCopy
    } case REDUX_ACTIONS.updateFormProjectUpdateFormModelDeleteOption: {
      const stateCopy = { original: state.original, mode: state.mode, project: { ...state.project } }
      stateCopy.project[RESERVED_AUDS_KEYS._sections][action.payload.indexSection].formModel[action.payload.indexFormElement].options.splice(action.payload.indexOptions, 1)
      return stateCopy
    } case REDUX_ACTIONS.updateFormProjectUpdateFormModelOptionValue: {
      const stateCopy = { original: state.original, mode: state.mode, project: { ...state.project } }
      stateCopy.project[RESERVED_AUDS_KEYS._sections][action.payload.indexSection].formModel[action.payload.indexFormElement].options[action.payload.indexOptions] = action.payload.formElement
      return stateCopy
    } default:
      return state
  }
}
