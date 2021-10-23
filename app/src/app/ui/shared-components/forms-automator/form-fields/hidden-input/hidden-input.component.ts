import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AbstractElement } from '@anita/client/ui/shared-components/forms-automator/form-fields/abstract-element';
import { HiddenInput } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';

@Component({
  selector: 'app-hidden-input',
  templateUrl: './hidden-input.component.html'
})
export class HiddenInputComponent {

  @Input()
  public formEle: HiddenInput<AbstractElement>;

  @Input()
  public formData: FormGroup;

}
