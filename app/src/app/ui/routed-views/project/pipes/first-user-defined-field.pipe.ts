import { Pipe, PipeTransform } from '@angular/core';
import { findFirstUserDefinedField } from '@anita/client/libs/tools/find-first-user-defined-field.function';

@Pipe({
  name: 'firstUserDefinedField'
})
export class FirstUserDefinedFieldPipe implements PipeTransform {

  public transform = findFirstUserDefinedField;

}
