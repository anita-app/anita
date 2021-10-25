import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FORM_COMPONENTS_CODES } from '@anita/client/data/model/form-model-commons';
import { FormFieldsModel } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';

@Component({
  selector: 'app-group-forms',
  templateUrl: './group-forms.component.html'
})
export class GroupFormsComponent<T extends FormFieldsModel<T>> {

  @Input()
  public formEles: Array<T>;

  @Input()
  public formData: FormGroup;

  public hiddenFormEleCode = FORM_COMPONENTS_CODES.hiddenInput;

  public trackFormEles(index: number, formElement: Object): string {
    return `${index}-${JSON.stringify(formElement)}`;
  }

}
