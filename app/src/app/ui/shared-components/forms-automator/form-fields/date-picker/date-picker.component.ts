import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AbstractElement } from '@anita/client/ui/shared-components/forms-automator/form-fields/abstract-element';
import { BasicInput } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html'
})
export class DatePickerComponent implements OnInit {

  @Input()
  public formEle: BasicInput<AbstractElement>;

  @Input()
  public formData: FormGroup;

  public ngOnInit(): void {
    if (typeof this.formData.controls[this.formEle.fieldName].value === 'string') {
      this.formData.controls[this.formEle.fieldName].patchValue(new Date(this.formData.controls[this.formEle.fieldName].value));
    }
  }

}
