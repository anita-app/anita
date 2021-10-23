import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { OptionKeysModel } from '@anita/client/data/model/form-model-commons';
import { currentRouteConstant } from '@anita/client/ng-services/app-routing/current-route.constant';
import { EDITOR_MODE } from '@anita/client/ui/editor-mode.enum';
import { FormInfoForBuilder } from '@anita/client/ui/shared-components/forms-automator/form-builder/form-builder';
import { FormDataParserService } from '@anita/client/ui/shared-components/forms-automator/form-builder/services/form-data-parser.service';
import { AbstractElement } from '@anita/client/ui/shared-components/forms-automator/form-fields/abstract-element';
import { BasicInput, BasicTextarea, FormModel } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';
import { optionsBuilderForAdding, optionsBuilderForEditing } from '@anita/client/ui/shared-components/forms-automator/form-fields/options-maker/options-builder.constant';
import { FormDataToValuesArray } from '@anita/client/ui/shared-components/forms-automator/form-fields/services/form-data-to-values-array.class';
import { formsArrayValidator } from '@anita/client/ui/shared-components/forms-automator/form-fields/services/forms-array-validator.function';

type OptionValue = string | number;

@Component({
  selector: 'app-options-maker',
  templateUrl: './options-maker.component.html',
  styleUrls: ['./options-maker.component.scss']
})
export class OptionsMakerComponent implements OnInit {

  @Input()
  public formEle: BasicTextarea<AbstractElement>;

  @Input()
  public formData: FormGroup;

  public arrOptionsEles: Array<FormInfoForBuilder<FormModel<BasicInput<AbstractElement>>>> = [];

  constructor(
    private formDataParser: FormDataParserService
  ) { }

  public ngOnInit(): void {
    if (this.formData.controls.options.value)
      return this.resetValuesFromFormData();

    this.addOption();
    this.addOption();
  }

  public addOption(value: string | number = this.arrOptionsEles.length + 1, txt?: string, readonly: boolean = false): void {
    const formDataModel = readonly ? optionsBuilderForEditing : optionsBuilderForAdding as any;
    const eles = this.formDataParser.make({ formDataModel, element: { value, txt } });
    this.arrOptionsEles.push(eles as FormInfoForBuilder<FormModel<BasicInput<AbstractElement>>>);
    this.handleFormDataChange(eles.formData);
    this.patchOptionsFormData();
  }

  public removeQuestion(index: number): void {
    this.arrOptionsEles.splice(index, 1);
    this.patchOptionsFormData();
  }

  private resetValuesFromFormData(): void {
    const isEditing = currentRouteConstant.data.mode === EDITOR_MODE.edit ? true : false;
    this.formData.controls.options.value.forEach((ele: OptionKeysModel) => {
      const readonly: boolean = (ele.value && isEditing);
      this.addOption(ele.value, ele.txt, readonly);
    });
  }

  private handleFormDataChange(formData: FormGroup): void {
    formData.valueChanges.subscribe(() => this.patchOptionsFormData());
  }

  private patchOptionsFormData(): void {
    // tslint:disable-next-line:no-null-keyword
    const options = formsArrayValidator(this.arrOptionsEles) ? new FormDataToValuesArray(this.arrOptionsEles).process() : null;
    this.formData.patchValue({ options });
  }

}
