import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormFieldsComponent } from '@anita/client/ui/shared-components/forms-automator/form-builder/form-fields-loaders/form-fields.component';
import { FormFieldsDirective } from '@anita/client/ui/shared-components/forms-automator/form-builder/form-fields-loaders/form-fields.directive';
import { FormTypeSwitcherComponent } from '@anita/client/ui/shared-components/forms-automator/form-builder/form-type-switcher/form-type-switcher.component';
import { GroupFormsComponent } from '@anita/client/ui/shared-components/forms-automator/form-builder/group-forms/group-forms.component';
import { StepperFormComponent } from '@anita/client/ui/shared-components/forms-automator/form-builder/stepper-form/stepper-form.component';
import { FormFieldsModule } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields.module';
import { NbButtonModule, NbStepperModule } from '@nebular/theme';

@NgModule({
  declarations: [
    FormFieldsComponent,
    FormFieldsDirective,
    StepperFormComponent,
    GroupFormsComponent,
    FormTypeSwitcherComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FormFieldsModule,
    NbStepperModule,
    NbButtonModule
  ],
  exports: [
    StepperFormComponent,
    GroupFormsComponent,
    FormTypeSwitcherComponent
  ]
})
export class FormBuilderModule { }
