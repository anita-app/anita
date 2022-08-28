import {
  LocalProjectSettings,
  IProjectSettings,
  ISection,
  SectionDetailsDeclaration,
  SectionElement,
  SystemData
} from 'app/data/project-structure/project-info'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { FormFieldsModel, TSupportedFormsTypes } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types'

export type Action<T extends REDUX_ACTIONS> = T extends ActionsWithoutPayload ? ActionWithoutPayload :
  ActionWithPayload<T>;

type ActionsWithoutPayload = REDUX_ACTIONS.updateFormProjectAddSection | REDUX_ACTIONS.toggleSidebar | REDUX_ACTIONS.setProjectEditorMode | REDUX_ACTIONS.resetCurrentProject;

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
  [REDUX_ACTIONS.updateFormElementKey]: { fieldName: keyof SectionElement, value: SectionElement[keyof SectionElement] };
  [REDUX_ACTIONS.setFormProject]: SystemData;
  [REDUX_ACTIONS.updateFormProjectSettings]: { fieldName: keyof IProjectSettings, value: IProjectSettings[keyof IProjectSettings] };
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
  [REDUX_ACTIONS.setProjectEditorMode]: void;
  [REDUX_ACTIONS.toggleSidebar]: void;
  [REDUX_ACTIONS.updateFormProjectAddSection]: void;
  [REDUX_ACTIONS.resetSectionForChildOfSelector]: void;
  [REDUX_ACTIONS.resetCurrentProject]: void;
}

export interface IValidStateForEle {
  formEleId: string;
  valid: boolean;
}

export interface IUpdateFormProjectUpdateSectionPayload {
  fieldName: keyof ISection;
  value: ISection[keyof ISection];
  index: number;
}

export interface IUpdateFormProjectUpdateFormModelOfSectionPayload {
  indexFormElement: number;
  indexSection: number;
  fieldName: keyof FormFieldsModel<TSupportedFormsTypes>;
  value: FormFieldsModel<TSupportedFormsTypes>[keyof FormFieldsModel<TSupportedFormsTypes>];
  identifierAutoVal: string | null;
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
  formElement: FormFieldsModel<TSupportedFormsTypes>;
  indexFormElement: number;
  indexSection: number;
  indexOptions: number
}
