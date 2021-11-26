import { PROJECT_EDITOR_FORM_BUILDER } from 'app/data/project-form-builder/project-editor-form-builder.const';
import { RESERVED_AUDS_KEYS, Section } from 'app/data/project-structure/project-info';
import { AnitaStore } from 'app/libs/redux/reducers.const';
import { DANGER_BTN_OUTLINE } from 'app/ui-react-components/shared-components/buttons/buttons-layout-tw-classes.const';
import { FormAutomator } from 'app/ui-react-components/shared-components/forms-automator/form-automator.component';
import { FormFieldsModel, ICommonFormEleProps, OptionKeysModel } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import ReactTooltip from 'react-tooltip';

/**
 * Checks if the OptionKeysModel was already in the section before we started editing.
 * We can't rely on the general edit mode of the form because we might have new options in edit mode.
 * @param section the section to which the current OptionKeysModel belongs
 * @param indexFormElement the index of the form model at which the current OptionKeysModel is, as we want to check only on the same form model
 * @param option the option to check
 * @returns the form model to use. We want different form models for adding and editing to disable fields that should not be altered.
 */
function getCanEdit(section: Section, indexFormElement: number, value: any): boolean {
  if (!section || !section.formModel[indexFormElement] || !section.formModel[indexFormElement]['options'] || !section.formModel[indexFormElement]['options'].length)
    return true;

  return !section.formModel[indexFormElement]['options'].some((opt: OptionKeysModel) => opt.value === value);
}

export const OptionsMakerSingleOption = (props: ICommonFormEleProps<FormFieldsModel<OptionKeysModel>>) => {
  const { formEle, element, handleOptionsChange, handleClickDeleteOption, indexSection, indexFormElement, index, optionElement } = props;
  const projectEditorMode = useSelector((store: AnitaStore) => store.formProject.mode);
  const section = useSelector((store: AnitaStore) => store.formProject.original[RESERVED_AUDS_KEYS._sections][indexSection]);
  const formModelToUse: Array<FormFieldsModel<any>> = useMemo(() => {
    const canEdit = getCanEdit(section, indexFormElement, optionElement.value);
    return canEdit ?
      PROJECT_EDITOR_FORM_BUILDER[projectEditorMode].optionEles.newItem :
      PROJECT_EDITOR_FORM_BUILDER[projectEditorMode].optionEles.newItem;
  }, [section, indexFormElement, optionElement.value, projectEditorMode]);

  return (
    <li>
      <FormAutomator
        formModel={formModelToUse}
        element={optionElement}
        handleChange={handleOptionsChange.bind(undefined, index, optionElement)} />
      {(typeof handleClickDeleteOption === 'function' && element[formEle.fieldName].length > 2) && <div className="inline-block w-full lg:w-1/12 px-2 lg:pl-1 lg:pr-3 lg:align-bottom mb-8">
        <button
          onClick={handleClickDeleteOption.bind(undefined, index)}
          data-tip data-for={`deleteOption-${index}`}
          className={`w-full py-1 ${DANGER_BTN_OUTLINE}`}
        ><i className="bi-trash hidden lg:block"></i><span className="lg:hidden">Delete option {index + 1}</span></button>
        <ReactTooltip id={`deleteOption-${index}`} effect="solid">
          <span>Delete option {index + 1}</span>
        </ReactTooltip>
      </div>}
    </li>
  )
};
