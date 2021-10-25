import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormModel } from '../../form-fields/form-fields-model';

@Component({
  selector: 'app-form-type-switcher',
  templateUrl: './form-type-switcher.component.html'
})
export class FormTypeSwitcherComponent {

  @Input()
  public stepper: 'horizontal' | 'vertical';

  @Input()
  public formModel: FormModel;

  @Input()
  public formData: FormGroup;

}
