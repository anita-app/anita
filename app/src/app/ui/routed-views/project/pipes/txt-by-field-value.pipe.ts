import { Pipe, PipeTransform } from '@angular/core';
import { OptionKeysModel } from '@anita/client/data/model/form-model-commons';

@Pipe({
  name: 'txtByFieldValue'
})
export class TxtByFieldValue implements PipeTransform {

  /**
   * Finds the text to be displayed for an option of a Radio or Select element based on the matching value
   */
  public transform(options: Array<OptionKeysModel>, toFindId: string | number): string {
    const optionToReturn = options.find(option => option.value === toFindId);

    if (typeof optionToReturn === 'undefined')
      return '';

    return optionToReturn.txt;
  }

}
