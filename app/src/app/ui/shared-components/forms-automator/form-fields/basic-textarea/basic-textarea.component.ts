import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AbstractElement } from '@anita/client/ui/shared-components/forms-automator/form-fields/abstract-element';
import { BasicTextarea } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';

@Component({
  selector: 'app-basic-textarea',
  templateUrl: './basic-textarea.component.html'
})
export class BasicTextareaComponent {

  @Input()
  public formEle: BasicTextarea<AbstractElement>;

  @Input()
  public formData: FormGroup;

}
