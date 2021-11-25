import { OptionKeysModel } from 'app/data/model/form-model-commons';
import { SUCCESS_BTN_OUTLINE } from 'app/ui-react-components/shared-components/buttons/buttons-layout-tw-classes.const';
import { FormFieldsModel, ICommonFormEleProps } from 'app/ui-react-components/shared-components/forms-automator/form-fields/form-fields-model';
import { OptionsMakerSingleOption } from 'app/ui-react-components/shared-components/forms-automator/form-fields/options-maker-single-option.component';

export const OptionsMaker = (props: ICommonFormEleProps<FormFieldsModel<OptionKeysModel>>) => {

  const { formEle, element, handleOptionsChange, handleClickAddOption } = props;

  if (typeof handleOptionsChange !== 'function')
    return null;

  if (!element[formEle.fieldName] || !Array.isArray(element[formEle.fieldName]) || !element[formEle.fieldName].length)
    element[formEle.fieldName] = Array.from(Array(2), () => ({ label: '', value: '' }));

  return (
    <div className="mt-6 pl-10 py-4 bg-gray-50 rounded-lg">
      <p className="-ml-5 font-semibold mb-1">Choices</p>
      <ol className="list-decimal">
        {element[formEle.fieldName].map((optionElement: OptionKeysModel, index) =>
          <OptionsMakerSingleOption key={index} index={index} optionElement={optionElement} {...props} />
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