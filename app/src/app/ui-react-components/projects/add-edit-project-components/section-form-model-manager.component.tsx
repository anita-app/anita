import { URL_PARAMS } from 'app/anita-routes/anita-routes.constant';
import { sectionFieldForEditing, sectionFieldForNewItem } from 'app/data/form-models/section-builder.constant';
import { OptionKeysModel } from 'app/data/model/form-model-commons';
import { RESERVED_UDS_KEYS, Section } from 'app/data/model/project-info';
import {
  IUpdateFormProjectUpdateFormModelAddOptionPayload,
  IUpdateFormProjectUpdateFormModelDeleteOptionPayload,
  IUpdateFormProjectUpdateFormModelOfSectionPayload,
  IUpdateFormProjectUpdateFormModelOptionValuePayload
  } from 'app/libs/redux/action.type';
import { AnitaStore } from 'app/libs/redux/reducers.const';
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const';
import { store } from 'app/libs/redux/state.store';
import { EDITOR_MODE } from 'app/ui-react-components/editor-mode.enum';
import { FormAutomator } from 'app/ui-react-components/shared-components/forms-automator/form-automator.component';
import { FormAutomatorOnChangeValue, FormFieldsModel, SupportedFormsTypes } from 'app/ui-react-components/shared-components/forms-automator/form-fields/form-fields-model';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';

interface ISectionFormModelManagerProps {
  indexSection: number;
  indexFormElement: number;
  element: FormFieldsModel<SupportedFormsTypes>;
}

const alreadyExists = (section: Section, fieldName: string): boolean => {
  if (!fieldName || !section) return false;
  return section.formModel.some(formElement => formElement.fieldName === fieldName);
}

export const SectionFormModelManager = (props: ISectionFormModelManagerProps) => {

  const { indexSection, indexFormElement, element } = props;

  const params = useParams();
  const sections = useSelector((state: AnitaStore) => state.formProject.original[RESERVED_UDS_KEYS._sections]);
  const mode = params[URL_PARAMS.projectId] ? EDITOR_MODE.edit : EDITOR_MODE.add;
  const formModelToUse = mode === EDITOR_MODE.edit && alreadyExists(sections[indexSection], element.fieldName) ? sectionFieldForEditing : sectionFieldForNewItem;

  const handleChange = (indexSection: number, indexFormElement: number, fieldName: string | number, value: FormAutomatorOnChangeValue) => {
    store.dispatch({
      type: REDUX_ACTIONS.updateFormProjectUpdateFormModelOfSection, payload: {
        indexSection,
        indexFormElement,
        formElement: { ...element, [fieldName]: value }
      } as IUpdateFormProjectUpdateFormModelOfSectionPayload
    });
  }

  const handleOptionsChange = (indexSection: number, indexFormElement: number, indexOptions: number, optionElement: OptionKeysModel, fieldName: string | number, value: FormAutomatorOnChangeValue) => {
    store.dispatch({
      type: REDUX_ACTIONS.updateFormProjectUpdateFormModelOptionValue, payload: {
        indexSection,
        indexFormElement,
        indexOptions,
        formElement: { ...optionElement, [fieldName]: value }
      } as IUpdateFormProjectUpdateFormModelOptionValuePayload
    });
  }

  const handleClickAddOption = (indexSection: number, indexFormElement: number) => {
    store.dispatch({
      type: REDUX_ACTIONS.updateFormProjectUpdateFormModelAddOption, payload: {
        indexSection,
        indexFormElement
      } as IUpdateFormProjectUpdateFormModelAddOptionPayload
    });
  }

  const handleClickDeleteOption = (indexSection: number, indexFormElement: number, indexOptions: number) => {
    store.dispatch({
      type: REDUX_ACTIONS.updateFormProjectUpdateFormModelDeleteOption, payload: {
        indexSection,
        indexFormElement,
        indexOptions
      } as IUpdateFormProjectUpdateFormModelDeleteOptionPayload
    });
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