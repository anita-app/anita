import { PROJECT_EDITOR_FORM_BUILDER } from 'app/data/project-form-builder/project-editor-form-builder.const'
import { RESERVED_AUDS_KEYS, ISection } from 'app/data/project-structure/project-info'
import { AnitaStore } from 'app/libs/redux/reducers.const'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { FormAutomator } from 'app/components/shared-components/forms-automator/form-automator.component'
import { FormFieldsModel, IBasicSelect, ICommonFormEleProps, IOptionKeysModel, TSupportedFormsTypes } from 'app/components/shared-components/forms-automator/form-automator.types'
import React, { memo, useMemo } from 'react'
import { useSelector } from 'react-redux'

/**
 * Checks if the OptionKeysModel was already in the section before we started editing.
 * We can't rely on the general edit mode of the form because we might have new options in edit mode.
 * @param section the section to which the current OptionKeysModel belongs
 * @param indexFormElement the index of the form model at which the current OptionKeysModel is, as we want to check only on the same form model
 * @param option the option to check
 * @returns the form model to use. We want different form models for adding and editing to disable fields that should not be altered.
 */
function getCanEdit (section: ISection, indexFormElement: number, value: string | number): boolean {
  if (!section || !section.formModel[indexFormElement] || !(section.formModel[indexFormElement] as IBasicSelect<TSupportedFormsTypes>).options || !(section.formModel[indexFormElement] as IBasicSelect<TSupportedFormsTypes>).options.length) {
    return true
  }

  return !(section.formModel[indexFormElement] as IBasicSelect<TSupportedFormsTypes>).options.some((opt: IOptionKeysModel) => opt.value === value)
}

export const OptionsMakerSingleOption: React.FC<ICommonFormEleProps<FormFieldsModel<IOptionKeysModel>>> = memo(function OptionsMakerSingleOption (props: ICommonFormEleProps<FormFieldsModel<IOptionKeysModel>>) {
  const { formEle, element, handleOptionsChange, handleClickDeleteOption, indexSection, indexFormElement, index, optionElement } = props
  const projectEditorMode = useSelector((store: AnitaStore) => store.formProject.mode)
  const section = useSelector((store: AnitaStore) => store.formProject.original[RESERVED_AUDS_KEYS._sections]![indexSection])
  const formModelToUse: Array<FormFieldsModel<TSupportedFormsTypes>> = useMemo(() => {
    const canEdit = getCanEdit(section, indexFormElement, optionElement.value)
    return canEdit
      ? [PROJECT_EDITOR_FORM_BUILDER[projectEditorMode].optionEles.newItem as unknown as FormFieldsModel<TSupportedFormsTypes>]
      : [PROJECT_EDITOR_FORM_BUILDER[projectEditorMode].optionEles.newItem as unknown as FormFieldsModel<TSupportedFormsTypes>]
  }, [section, indexFormElement, optionElement.value, projectEditorMode])

  return (
    <li>
      <FormAutomator
        formModel={formModelToUse}
        element={optionElement}
        handleChange={handleOptionsChange.bind(undefined, index, optionElement)}
      />
      {(typeof handleClickDeleteOption === 'function' && element[formEle.fieldName].length > 2) && (
        <div className="flex w-full px-2 lg:pl-1 lg:pr-3 lg:justify-end mb-8">
          <Button
            id={`deleteOption-${index + 1}`}
            label={`Delete option ${index + 1}`}
            icon="trashOutline"
            type="danger"
            fill="outline"
            hasTooltip={true}
            onClick={handleClickDeleteOption.bind(undefined, index)}
            marginClassName=''
            className="w-full lg:w-12"
            labelClassName="lg:hidden"
            tooltipContainerClassName="hidden lg:block"
          />
        </div>
      )}
    </li>
  )
})
