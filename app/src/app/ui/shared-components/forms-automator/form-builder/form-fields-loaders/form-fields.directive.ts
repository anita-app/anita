import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[appFormFields]'
})
export class FormFieldsDirective {

  constructor(
    public viewContainerRef: ViewContainerRef
  ) { }

}
