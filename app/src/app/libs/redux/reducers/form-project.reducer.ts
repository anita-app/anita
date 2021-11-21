import { OptionKeysModel } from 'app/data/model/form-model-commons';
import { RESERVED_UDS_KEYS, SystemData } from 'app/data/model/project-info';
import { IdCreator } from 'app/libs/id-creator/id-creator.class';
import { Action } from 'app/libs/redux/action.type';
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const';
import cloneDeep from 'lodash.clonedeep';

export interface IFormProjectState {
  original: Partial<SystemData>;
  project: Partial<SystemData>;
}

/**
 * The initial state of the container of the current project
 */
const formElementState: IFormProjectState = {
  original: {
    [RESERVED_UDS_KEYS._settings]: [],
    [RESERVED_UDS_KEYS._sections]: []
  },
  project: {
    [RESERVED_UDS_KEYS._settings]: [],
    [RESERVED_UDS_KEYS._sections]: []
  }
};

/**
 * Updates the projectState
 */
export const formProjectReducer = (state: IFormProjectState = formElementState, action: Action<REDUX_ACTIONS>): IFormProjectState => {
  switch (action.type) {
    case REDUX_ACTIONS.setFormProject:
      // Here we need a deep copy of the project to leave the source unchanged in case the user cancel the edits, 
      // and to "unlink" the Object set on the `project` key from the one set on the `original` key.
      return { original: action.payload, project: cloneDeep(action.payload) };
    case REDUX_ACTIONS.updateFormProjectSettings:
      return {
        original: state.original,
        project: {
          ...state.project,
          [RESERVED_UDS_KEYS._settings]: [{ ...action.payload }]
        }
      };
    case REDUX_ACTIONS.updateFormProjectAddSection:
      return {
        original: state.original,
        project: {
          ...state.project,
          [RESERVED_UDS_KEYS._sections]: state.project[RESERVED_UDS_KEYS._sections].concat({
            id: IdCreator.random(),
            title: "",
            formModel: [{} as any]
          })
        }
      };
    case REDUX_ACTIONS.updateFormProjectUpdateSection:
      const copy3 = { original: state.original, project: { ...state.project } };
      copy3.project[RESERVED_UDS_KEYS._sections][action.payload.index] = { ...action.payload.section };
      return copy3;
    case REDUX_ACTIONS.updateFormProjectUpdateFormModelOfSection:
      const copy4 = { original: state.original, project: { ...state.project } };
      copy4.project[RESERVED_UDS_KEYS._sections][action.payload.indexSection].formModel[action.payload.indexFormElement] = { ...action.payload.formElement };
      return copy4;
    case REDUX_ACTIONS.updateFormProjectAddFieldToSection:
      const copy5 = { original: state.original, project: { ...state.project } };
      copy5.project[RESERVED_UDS_KEYS._sections][action.payload].formModel.push({} as any);
      return copy5;
    case REDUX_ACTIONS.updateFormProjectRemoveFieldFromSection:
      const copy6 = { original: state.original, project: { ...state.project } };
      copy6.project[RESERVED_UDS_KEYS._sections][action.payload.sectionIndex].formModel.splice(action.payload.fieldIndex, 1);
      return copy6;
    case REDUX_ACTIONS.updateFormProjectRemoveSection:
      const copy7 = { original: state.original, project: { ...state.project } };
      copy7.project[RESERVED_UDS_KEYS._sections].splice(action.payload, 1);
      return copy7;
    case REDUX_ACTIONS.updateFormProjectUpdateFormModelAddOption:
      const copy8 = { original: state.original, project: { ...state.project } };
      copy8.project[RESERVED_UDS_KEYS._sections][action.payload.indexSection].formModel[action.payload.indexFormElement]['options'].push({ label: "", value: "" } as OptionKeysModel);
      return copy8;
    case REDUX_ACTIONS.updateFormProjectUpdateFormModelDeleteOption:
      const copy9 = { original: state.original, project: { ...state.project } };
      copy9.project[RESERVED_UDS_KEYS._sections][action.payload.indexSection].formModel[action.payload.indexFormElement]['options'].splice(action.payload.indexOptions, 1);
      return copy9;
    case REDUX_ACTIONS.updateFormProjectUpdateFormModelOptionValue:
      const copy10 = { original: state.original, project: { ...state.project } };
      copy10.project[RESERVED_UDS_KEYS._sections][action.payload.indexSection].formModel[action.payload.indexFormElement]['options'][action.payload.indexOptions] = action.payload.formElement;
      return copy10;
    default:
      return state;
  }
}
