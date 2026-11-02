import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { OptionsMakerSingleOption } from 'app/components/shared-components/forms-automator/form-fields/options-maker-single-option.component'
import { memo } from 'react'
import type { FC } from 'react'
import type { FormFieldsModel, ICommonFormEleProps, IOptionKeysModel } from 'app/components/shared-components/forms-automator/form-automator.types'

/**
 * @feature field.choices
 * @title Choices of a drop-down or alternative choice
 * @summary Define the list of values that can be picked in a Drop-down list or Alternative choice field.
 * @where Project editor, in a field with Data type "Drop-down list" or "Alternative choice": the "Choices" box, with a numbered list of choices, the "Add Choice" button and a delete button for each choice.
 * @usage Give the field the Data type "Drop-down list" or "Alternative choice": the "Choices" box appears with two empty choices. Type the Label of each choice. Click "Add Choice" to add another one, or the delete button of a choice ("Delete option" and its number) to remove it. Save the project.
 * @options Label of each choice (required). In advanced mode, also the Value stored in the records (by default 1, 2, 3... in the order the choices are added).
 * @rules A field always has at least two choices: the delete buttons appear only when there are more than two. Records store the value of the choice, not its label: renaming a label changes how all the records show it, while deleting a choice, or changing its value in advanced mode, leaves the records that had it with an empty field. The project cannot be saved while a choice has no label.
 * @errors none
 * @status stable
 * @since 0.1.0
 * @related field.drop-down, field.alternative-choice
 */
export const OptionsMaker: FC<ICommonFormEleProps<FormFieldsModel<IOptionKeysModel>>> = memo(function OptionsMaker (props: ICommonFormEleProps<FormFieldsModel<IOptionKeysModel>>) {
  const { formEle, element, handleOptionsChange, handleClickAddOption } = props

  if (typeof handleOptionsChange !== 'function') {
    return null
  }

  if (!element[formEle.fieldName] || !Array.isArray(element[formEle.fieldName]) || !element[formEle.fieldName].length) {
    element[formEle.fieldName] = Array.from(Array(2), (a, i) => ({ label: '', value: i + 1 }))
  }

  return (
    <div className="mt-6 pl-10 py-4 bg-gray-50 rounded-lg">
      <p className="-ml-5 font-semibold mb-1">Choices</p>
      <ol className="list-decimal">
        {element[formEle.fieldName].map((optionElement: IOptionKeysModel, index: number) => (<OptionsMakerSingleOption
          key={`${optionElement.value}-${index}`}
          index={index}
          optionElement={optionElement}
          {...props}
                                                                                             />),
        )}
      </ol>
      {(typeof handleClickAddOption === 'function') && (
        <div className="flex justify-end">
          <Button
            id="addChoice"
            label="Add Choice"
            type={Type.success}
            fill="outline"
            marginClassName="mr-3"
            onClick={handleClickAddOption}
          />
        </div>
      )}
    </div>
  )
})
