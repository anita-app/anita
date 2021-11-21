import { optionsBuilderForAdding, optionsBuilderForEditing } from 'app/data/form-models/options-builder.constant';
import { OptionKeysModel } from 'app/data/model/form-model-commons';
import { RESERVED_UDS_KEYS, Section } from 'app/data/model/project-info';
import { AnitaStore } from 'app/libs/redux/reducers.const';
import { DANGER_BTN_OUTLINE, SUCCESS_BTN_OUTLINE } from 'app/ui-react-components/shared-components/buttons/buttons-layout-tw-classes.const';
import { FormAutomator } from 'app/ui-react-components/shared-components/forms-automator/form-automator.component';
import { FormFieldsModel, ICommonFormEleProps } from 'app/ui-react-components/shared-components/forms-automator/form-fields/form-fields-model';
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
function getFormModelToUse(section: Section, indexFormElement: number, option: OptionKeysModel): Array<FormFieldsModel<OptionKeysModel>> {
  if (!section || !section.formModel[indexFormElement] || !section.formModel[indexFormElement]['options'] || !section.formModel[indexFormElement]['options'].length)
    return optionsBuilderForAdding;

  const exists = section.formModel[indexFormElement]['options'].some((opt: OptionKeysModel) => opt.value === option.value);
  return exists ? optionsBuilderForEditing : optionsBuilderForAdding;
}

export const OptionsMaker = ({ formEle, element, handleOptionsChange, handleClickAddOption, handleClickDeleteOption, indexSection, indexFormElement }: ICommonFormEleProps<FormFieldsModel<OptionKeysModel>>) => {

  const sections = useSelector((store: AnitaStore) => store.formProject.original[RESERVED_UDS_KEYS._sections]);

  if (!element[formEle.fieldName] || typeof handleOptionsChange !== 'function')
    return null;

  return (
    <div className="mt-6 pl-10 py-4 bg-gray-50 rounded-lg">
      <p className="-ml-5 font-semibold mb-1">Choices</p>
      <ol className="list-decimal">
        {element[formEle.fieldName].map((optionElement: OptionKeysModel, index) =>
          <li key={index}>
            <FormAutomator
              formModel={getFormModelToUse(sections[indexSection], indexFormElement, optionElement) as Array<FormFieldsModel<any>>}
              element={optionElement}
              handleChange={handleOptionsChange.bind(undefined, index, optionElement)} />
            {(typeof handleClickDeleteOption === 'function' && element[formEle.fieldName].length > 1) && <div className="inline-block w-full lg:w-1/12 px-2 lg:pl-1 lg:pr-3 lg:align-bottom mb-8">
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
        )}
      </ol>
      {(typeof handleClickAddOption === 'function') &&
        <div className="flex items-end">
          <button
            className={`ml-auto mr-4 mt-3 py-2 px-3 ${SUCCESS_BTN_OUTLINE}`}
            onClick={handleClickAddOption}
          >
            Add option
          </button>
        </div>
      }
    </div>
  )
};