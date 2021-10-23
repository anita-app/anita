import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AbstractElement } from '@anita/client/ui/shared-components/forms-automator/form-fields/abstract-element';
import { BasicRadio } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';

@Component({
  selector: 'app-basic-radio',
  templateUrl: './basic-radio.component.html'
})
export class BasicRadioComponent implements OnInit {

  @Input()
  public formEle: BasicRadio<AbstractElement>;

  @Input()
  public formData: FormGroup;

  public valueRadio: BasicRadio<AbstractElement>['value'];

  public ngOnInit(): void {
    this.valueRadio = this.formData.value[this.formEle.fieldName];
  }

  public changedValue(): void {
    const newVal: { [key: string]: BasicRadio<AbstractElement>['value'] } = {};
    newVal[this.formEle.fieldName as string] = this.valueRadio;
    this.formData.patchValue(newVal);
  }

}
