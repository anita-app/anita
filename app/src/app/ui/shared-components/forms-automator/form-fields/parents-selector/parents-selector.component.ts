import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { OptionKeysModel } from '@anita/client/data/model/form-model-commons';
import { AbstractElement } from '@anita/client/ui/shared-components/forms-automator/form-fields/abstract-element';
import { BasicSelect } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';

@Component({
  selector: 'app-parents-selector',
  templateUrl: './parents-selector.component.html',
  styleUrls: ['./parents-selector.component.scss']
})
export class ParentsSelectorComponent implements OnInit {

  @Input()
  public formEle: BasicSelect<AbstractElement>;

  @Input()
  public formData: FormGroup;

  public valueRadio: BasicSelect<AbstractElement>['value'];

  public ngOnInit(): void {
    console.log('ciao');
  }

  public trackItems(index: number, item: OptionKeysModel): string | number {
    return item.value;
  }

}
