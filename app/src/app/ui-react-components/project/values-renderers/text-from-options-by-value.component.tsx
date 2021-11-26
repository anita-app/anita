import { txtByFieldValue } from 'app/libs/project-helpers/txt-by-field-value.function';
import { OptionKeysModel } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types';

export const TextFromOptionsByValue = (options: Array<OptionKeysModel>, { value }: { value: string | number }) => txtByFieldValue(options, value);
