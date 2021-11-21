import { OptionKeysModel } from 'app/data/model/form-model-commons';
import { txtByFieldValue } from 'app/libs/project-helpers/txt-by-field-value.function';

export const TextFromOptionsByValue = (options: Array<OptionKeysModel>, { value }: { value: string | number }) => txtByFieldValue(options, value);
