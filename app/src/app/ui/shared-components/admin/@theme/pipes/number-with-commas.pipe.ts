import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'ngxNumberWithCommas' })
export class NumberWithCommasPipe implements PipeTransform {

  public transform(input: number): string {
    return new Intl.NumberFormat().format(input);
  }
}
