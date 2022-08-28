import { SectionElement } from 'app/Models/SectionElement/SectionElement.class'
import { IOptionKeysModel } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types'

interface ITextFromOptionsByValueProps {
  value: string | number
}

export const TextFromOptionsByValue = (options: Array<IOptionKeysModel>, { value }: ITextFromOptionsByValueProps) => SectionElement.txtByFieldValue(options, value)
