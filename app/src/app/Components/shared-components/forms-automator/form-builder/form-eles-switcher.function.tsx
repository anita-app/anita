import { SectionElement } from 'app/data/project-structure/project-info'
import { IBasicRadio, IBasicSelect, ICommonFormEleProps } from 'app/Components/shared-components/forms-automator/form-automator.types'
import { FORM_COMPONENTS_CODES } from 'app/Components/shared-components/forms-automator/form-component-codes.enum'
import { BasicCheckbox } from 'app/Components/shared-components/forms-automator/form-fields/basic-checkbox.component'
import { BasicInput } from 'app/Components/shared-components/forms-automator/form-fields/basic-input.component'
import { BasicRadio } from 'app/Components/shared-components/forms-automator/form-fields/basic-radio.component'
import { BasicSelect } from 'app/Components/shared-components/forms-automator/form-fields/basic-select.component'
import { BasicTextarea } from 'app/Components/shared-components/forms-automator/form-fields/basic-textarea.component'
import { ChildOfSelectorForSection } from 'app/Components/shared-components/forms-automator/form-fields/child-of-selector-for-section.component'
import { HiddenInput } from 'app/Components/shared-components/forms-automator/form-fields/hidden-input.component'
import { OptionsMaker } from 'app/Components/shared-components/forms-automator/form-fields/options-maker.component'
import { ParentsSelector } from 'app/Components/shared-components/forms-automator/form-fields/parents-selector.component'
import React from 'react'

export function formElesSwitcher (key: string, componentCode: FORM_COMPONENTS_CODES, props: ICommonFormEleProps) {
  const codaAsInt = typeof componentCode === 'number' ? componentCode : parseInt(componentCode, 10)
  switch (codaAsInt) {
    case FORM_COMPONENTS_CODES.hiddenInput:
      return <HiddenInput key={key} {...props} />
    case FORM_COMPONENTS_CODES.basicInput:
    case FORM_COMPONENTS_CODES.datePicker:
    case FORM_COMPONENTS_CODES.dateTimePicker:
      return <BasicInput key={key} {...props} />
    case FORM_COMPONENTS_CODES.basicSelect:
      return <BasicSelect key={key} {...props as ICommonFormEleProps<IBasicSelect<SectionElement>>} />
    case FORM_COMPONENTS_CODES.basicTextarea:
      return <BasicTextarea key={key} {...props} />
    case FORM_COMPONENTS_CODES.basicCheckbox:
      return <BasicCheckbox key={key} {...props} />
    case FORM_COMPONENTS_CODES.basicRadio:
      return <BasicRadio key={key} {...props as ICommonFormEleProps<IBasicRadio<SectionElement>>} />
    case FORM_COMPONENTS_CODES.optionsMaker:
      return <OptionsMaker key={key} {...props} />
    case FORM_COMPONENTS_CODES.childOfSelectorForSection:
      return <ChildOfSelectorForSection key={key} {...props as ICommonFormEleProps<IBasicSelect<SectionElement>>} />
    case FORM_COMPONENTS_CODES.parentsSelector:
      return <ParentsSelector key={key} {...props as ICommonFormEleProps<IBasicSelect<SectionElement>>} />
    default:
      return <BasicInput key={key} {...props} />
  }
}
