import { OptionKeysModel } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types';
/* eslint-disable eqeqeq */

/**
 * Finds the text to be displayed for an option of a Radio or Select element based on the matching value
 */
export function txtByFieldValue(options: Array<OptionKeysModel>, toFindId: string | number): string | null {
  // We use relaxed equal (==) here because the value of the radio button might be a string or a number.
  const optionToReturn = options.find(option => option.value == toFindId);

  if (typeof optionToReturn === 'undefined')
    return null;

  return optionToReturn.label;
}

