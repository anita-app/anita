import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BasicCheckboxComponent } from '@anita/client/ui/shared-components/forms-automator/form-fields/basic-checkbox/basic-checkbox.component';
import { BasicInputComponent } from '@anita/client/ui/shared-components/forms-automator/form-fields/basic-input/basic-input.component';
import { BasicRadioComponent } from '@anita/client/ui/shared-components/forms-automator/form-fields/basic-radio/basic-radio.component';
import { BasicSelectComponent } from '@anita/client/ui/shared-components/forms-automator/form-fields/basic-select/basic-select.component';
import { BasicTextareaComponent } from '@anita/client/ui/shared-components/forms-automator/form-fields/basic-textarea/basic-textarea.component';
import { ChildOfSelectorForSectionComponent } from '@anita/client/ui/shared-components/forms-automator/form-fields/child-of-selector-for-section/child-of-selector-for-section.component';
import { DateTimePickerComponent } from '@anita/client/ui/shared-components/forms-automator/form-fields/date-time-picker/date-time-picker.component';
import { OptionsMakerComponent } from '@anita/client/ui/shared-components/forms-automator/form-fields/options-maker/options-maker.component';
import { RequiredLabelComponent } from '@anita/client/ui/shared-components/forms-automator/form-fields/required-label/required-label.component';
import { ValidatorCheckerDirective } from '@anita/client/ui/shared-components/forms-automator/form-fields/validator-checker.directive';
import {
  NbButtonModule,
  NbCardModule,
  NbCheckboxModule,
  NbDatepickerModule,
  NbDialogModule,
  NbIconModule,
  NbRadioModule,
  NbSelectModule,
  NbTimepickerModule,
  NbTooltipModule
  } from '@nebular/theme';
import { DatePickerComponent } from './date-picker/date-picker.component';
import { HiddenInputComponent } from './hidden-input/hidden-input.component';

export type SupportedComponents =
  HiddenInputComponent |
  BasicInputComponent |
  BasicTextareaComponent |
  BasicCheckboxComponent |
  BasicRadioComponent |
  BasicSelectComponent |
  OptionsMakerComponent |
  DatePickerComponent |
  DateTimePickerComponent |
  ChildOfSelectorForSectionComponent;

const FormComponents = [
  HiddenInputComponent,
  BasicInputComponent,
  BasicTextareaComponent,
  BasicCheckboxComponent,
  BasicRadioComponent,
  BasicSelectComponent,
  OptionsMakerComponent,
  DatePickerComponent,
  DateTimePickerComponent,
  ChildOfSelectorForSectionComponent
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    NbCheckboxModule,
    NbDialogModule,
    NbCardModule,
    NbButtonModule,
    NbTooltipModule,
    NbRadioModule,
    NbSelectModule,
    NbIconModule,
    NbDatepickerModule,
    NbTimepickerModule
  ],
  declarations: [
    ValidatorCheckerDirective,
    RequiredLabelComponent,
    ...FormComponents
  ],
  entryComponents: [
    ...FormComponents
  ],
  exports: FormComponents
})
export class FormFieldsModule { }
