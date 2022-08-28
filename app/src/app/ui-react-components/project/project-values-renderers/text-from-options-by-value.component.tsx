import { txtByFieldValue } from 'app/libs/project-helpers/txt-by-field-value.function';
import { OptionKeysModel } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types';

interface ITextFromOptionsByValueProps {
  value: string | number
}

export const TextFromOptionsByValue = (options: Array<OptionKeysModel>, { value }: ITextFromOptionsByValueProps) => txtByFieldValue(options, value);
