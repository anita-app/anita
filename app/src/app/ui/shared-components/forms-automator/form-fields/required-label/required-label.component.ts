import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-required-label',
  templateUrl: './required-label.component.html'
})
export class RequiredLabelComponent {

  @Input()
  public formEle: AbstractControl;

  @Input()
  public label: string;

}
