import {
  LocalProjectSettings,
  ProjectSettings,
  Section,
  SectionDetailsDeclaration,
  SectionElement,
  SystemData
  } from 'app/data/model/project-info';
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const';
import { FormFieldsModel, SupportedFormsTypes } from 'app/ui-react-components/shared-components/forms-automator/form-fields/form-fields-model';

export type Action<T extends REDUX_ACTIONS> = T extends ActionsWithoutPayload ? ActionWithoutPayload :
  ActionWithPayload<T>;

type ActionsWithoutPayload = REDUX_ACTIONS.updateFormProjectAddSection | REDUX_ACTIONS.toggleSidebar;

interface ActionWithPayload<T extends REDUX_ACTIONS> {
  type: T;
  payload: ActionsPayloads[T];
}

interface ActionWithoutPayload {
  type: ActionsWithoutPayload;
}

interface ActionsPayloads {
  [REDUX_ACTIONS.addProjectToList]: LocalProjectSettings;
  [REDUX_ACTIONS.setProjectList]: Array<LocalProjectSettings>;
  [REDUX_ACTIONS.setCurrentProject]: SystemData;
  [REDUX_ACTIONS.addSectionForChildOfSelector]: SectionDetailsDeclaration;
  [REDUX_ACTIONS.updateFormElement]: SectionElement;
  [REDUX_ACTIONS.setFormProject]: SystemData;
  [REDUX_ACTIONS.updateFormProjectSettings]: ProjectSettings;
  [REDUX_ACTIONS.setValidStateForEle]: IValidStateForEle;
  [REDUX_ACTIONS.unsetValidStateForEle]: string;
  [REDUX_ACTIONS.updateFormProjectUpdateSection]: IUpdateFormProjectUpdateSectionPayload;
  [REDUX_ACTIONS.updateFormProjectUpdateFormModelOfSection]: IUpdateFormProjectUpdateFormModelOfSectionPayload;
  [REDUX_ACTIONS.updateFormProjectAddFieldToSection]: number;
  [REDUX_ACTIONS.updateFormProjectRemoveFieldFromSection]: IUpdateFormProjectRemoveFieldFromSectionPayload;
  [REDUX_ACTIONS.updateFormProjectRemoveSection]: number;
  [REDUX_ACTIONS.updateFormProjectUpdateFormModelAddOption]: IUpdateFormProjectUpdateFormModelAddOptionPayload;
  [REDUX_ACTIONS.updateFormProjectUpdateFormModelDeleteOption]: IUpdateFormProjectUpdateFormModelDeleteOptionPayload;
  [REDUX_ACTIONS.updateFormProjectUpdateFormModelOptionValue]: IUpdateFormProjectUpdateFormModelOptionValuePayload;
  [REDUX_ACTIONS.toggleSidebar]: void;
  [REDUX_ACTIONS.updateFormProjectAddSection]: void;
  [REDUX_ACTIONS.resetSectionForChildOfSelector]: void;
}

export interface IValidStateForEle {
  formEleId: string;
  valid: boolean;
}

export interface IUpdateFormProjectUpdateSectionPayload {
  section: Section;
  index: number;
}

export interface IUpdateFormProjectUpdateFormModelOfSectionPayload {
  formElement: FormFieldsModel<SupportedFormsTypes>,
  indexFormElement: number;
  indexSection: number;
}

export interface IUpdateFormProjectRemoveFieldFromSectionPayload {
  sectionIndex: number;
  fieldIndex: number;
}

export interface IUpdateFormProjectUpdateFormModelAddOptionPayload {
  indexSection: number;
  indexFormElement: number;
}

export interface IUpdateFormProjectUpdateFormModelDeleteOptionPayload {
  indexSection: number;
  indexFormElement: number;
  indexOptions: number;
}

export interface IUpdateFormProjectUpdateFormModelOptionValuePayload {
  formElement: FormFieldsModel<SupportedFormsTypes>;
  indexFormElement: number;
  indexSection: number;
  indexOptions: number
}