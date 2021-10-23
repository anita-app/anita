import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AbstractElement } from '@anita/client/ui/shared-components/forms-automator/form-fields/abstract-element';
import { BasicInput } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';

@Component({
  selector: 'app-basic-input',
  templateUrl: './basic-input.component.html'
})
export class BasicInputComponent implements OnInit {

  @Input()
  public formEle: BasicInput<AbstractElement>;

  @Input()
  public formData: FormGroup;

  /**
   * Definition of the attribute here as TypeScript (v. >=3.4.0 <3.6.0) throws an error when joining the strings in the template
   *
   * @remarks
   * This is a workaround, to check if the error disappears with newer versions of TS
   */
  public attrAriaDescribedBy: string;

  public ngOnInit(): void {
    this.attrAriaDescribedBy = `${this.formEle.fieldName}Help`;
  }

}
