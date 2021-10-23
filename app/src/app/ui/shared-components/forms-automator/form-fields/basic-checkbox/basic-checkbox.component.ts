import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AbstractElement } from '@anita/client/ui/shared-components/forms-automator/form-fields/abstract-element';
import { BasicCheckbox } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';

@Component({
  selector: 'app-basic-checkbox',
  templateUrl: './basic-checkbox.component.html'
})
export class BasicCheckboxComponent {

  @Input()
  public formEle: BasicCheckbox<AbstractElement>;

  @Input()
  public formData: FormGroup;

}
