import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { FormFieldsModel, ICommonFormEleProps, IOptionKeysModel } from 'app/components/shared-components/forms-automator/form-automator.types'
import { OptionsMakerSingleOption } from 'app/components/shared-components/forms-automator/form-fields/options-maker-single-option.component'
import React, { memo } from 'react'

export const OptionsMaker: React.FC<ICommonFormEleProps<FormFieldsModel<IOptionKeysModel>>> = memo(function OptionsMaker (props: ICommonFormEleProps<FormFieldsModel<IOptionKeysModel>>) {
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
        {element[formEle.fieldName].map((optionElement: IOptionKeysModel, index: number) => <OptionsMakerSingleOption key={`${optionElement.value}-${index}`} index={index} optionElement={optionElement} {...props} />
        )}
      </ol>
      {(typeof handleClickAddOption === 'function') &&
        (<div className="flex justify-end">
          <Button
            id='addChoice'
            label='Add Choice'
            type={Type.success}
            fill="outline"
            marginClassName="mr-3"
            onClick={handleClickAddOption}
          />
         </div>)}
    </div>
  )
})
