import { Component, Input, OnChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FORM_COMPONENTS_CODES } from '@anita/client/data/model/form-model-commons';
import { FormFieldsModel } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';

@Component({
  selector: 'app-stepper-form',
  templateUrl: './stepper-form.component.html'
})
export class StepperFormComponent<T extends FormFieldsModel<T>> implements OnChanges {

  @Input()
  public formModel: Array<T>;

  @Input()
  public formData: FormGroup;

  @Input()
  public stepperDirection: 'horizontal' | 'vertical';

  public formEles = {
    show: [],
    hidden: []
  };

  public ngOnChanges(): void {
    this.formModel.forEach(formEle => {
      const scope = formEle.componentCode === FORM_COMPONENTS_CODES.hiddenInput ? 'hidden' : 'show';
      this.formEles[scope].push(formEle);
    });
  }

  public trackFormEles(index: number, formElement: T): string {
    return formElement['fieldName'] as string;
  }

}
