import {
  AfterContentInit,
  Component,
  ComponentFactoryResolver,
  Input,
  ViewChild
  } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { COMPONENT_CODE_TO_COMPONENT, FORM_COMPONENTS_CODES } from '@anita/client/data/model/form-model-commons';
import { FormFieldsDirective } from '@anita/client/ui/shared-components/forms-automator/form-builder/form-fields-loaders/form-fields.directive';
import { SupportedComponents } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields.module';

@Component({
  selector: 'app-form-fields',
  template: '<ng-template appFormFields></ng-template>'
})
export class FormFieldsComponent implements AfterContentInit {

  @Input()
  public componentCode: FORM_COMPONENTS_CODES;

  @Input()
  public formEle: any;

  @Input()
  public formData: FormGroup;

  @ViewChild(FormFieldsDirective, { static: true })
  public formFieldsDirective: FormFieldsDirective;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver
  ) { }

  public ngAfterContentInit(): void {
    this.loadComponent();
  }

  private loadComponent(): void {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory<SupportedComponents>(COMPONENT_CODE_TO_COMPONENT[this.componentCode]);

    if (!componentFactory)
      return this.logError();

    const viewContainerRef = this.formFieldsDirective.viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent(componentFactory);
    (componentRef.instance).formEle = this.formEle;
    (componentRef.instance).formData = this.formData;
  }

  private logError(): void {
    console.error('Component not found: ', this.componentCode);
  }

}
