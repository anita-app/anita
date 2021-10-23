import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { OptionKeysModel } from '@anita/client/data/model/form-model-commons';
import { AbstractElement } from '@anita/client/ui/shared-components/forms-automator/form-fields/abstract-element';
import { BasicSelect } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';

@Component({
  selector: 'app-basic-select',
  templateUrl: './basic-select.component.html',
  styleUrls: ['./basic-select.component.scss']
})
export class BasicSelectComponent implements OnInit {

  @Input()
  public formEle: BasicSelect<AbstractElement>;

  @Input()
  public formData: FormGroup;

  /**
   * Definition of the attribute here as TypeScript (v. >=3.4.0 <3.6.0) throws an error when joining the strings in the template
   *
   * @remarks
   * This is a workaround, to check if the error disappears with newer versions of TS
   */
  public attrAriaDescribedBy: string;

  public valueRadio: BasicSelect<AbstractElement>['value'];

  public ngOnInit(): void {
    this.attrAriaDescribedBy = `${this.formEle.fieldName}Help`;
  }

  public trackItems(index: number, item: OptionKeysModel): string | number {
    return item.value;
  }

}
