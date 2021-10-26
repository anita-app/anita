import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { dbInstances } from '@anita/client/data/db-instances.const';
import { SectionCustomFieldProperties, SectionElement } from '@anita/client/data/model/project-info';
import { SectionModel } from '@anita/client/libs/db-connector/db-builder/sez-definition';
import { currentRouteConstant, URL_PARAMS } from '@anita/client/ng-services/app-routing/current-route.constant';
import { FormInfoForBuilder } from '@anita/client/ui/shared-components/forms-automator/form-builder/form-builder';
import { FormControlMaker } from '@anita/client/ui/shared-components/forms-automator/form-builder/services/form-control-maker.class';
import { PrerequisitesChecker } from '@anita/client/ui/shared-components/forms-automator/form-builder/services/prerequisites-checker.class';
import { FormFieldsModel } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';

interface MakeArgs {
  formDataModel: Array<FormFieldsModel<Partial<SectionCustomFieldProperties | SectionElement>>>;
  section?: string | number;
  element?: Partial<SectionElement>;
}

@Injectable({
  providedIn: 'root'
})
export class FormDataParserService {

  private formDataModel: Array<FormFieldsModel<Partial<SectionCustomFieldProperties | SectionElement>>>;
  private formGroup: { [key: string]: FormControl };
  private dynamicForm: FormGroup;
  private element: Partial<SectionElement>;
  private section: string | number;
  private payload: FormInfoForBuilder<Array<FormFieldsModel<Partial<SectionElement>>>>;
  private sectionModelInDS: SectionModel<SectionElement>;

  constructor(
    private formBuilder: FormBuilder
  ) { }

  public make({ formDataModel, section, element = {} }: MakeArgs): FormInfoForBuilder<Array<FormFieldsModel<Partial<SectionElement | SectionCustomFieldProperties>>>> {
    this.formGroup = {};
    this.formDataModel = formDataModel;

    if (section)
      this.setSectionModel(section);

    this.section = (this.sectionModelInDS) ? section : undefined;

    this.element = element;

    this.setElementPkFromUrlParams();

    this.setFormProps();
    this.setFormGroup();
    this.setPayload();

    return this.payload;
  }

  private setSectionModel(section: any): void {
    const projectId = currentRouteConstant.params[URL_PARAMS.projectId];

    if (projectId && dbInstances[projectId].DS[section])
      this.sectionModelInDS = dbInstances[projectId].DS[section];
  }

  private setElementPkFromUrlParams(): void {
    if (this.section && !this.element[this.sectionModelInDS.parentsIdentifiers as string] && currentRouteConstant.params[URL_PARAMS.parentId])
      this.element[this.sectionModelInDS.parentsIdentifiers as string] = currentRouteConstant.params[URL_PARAMS.parentId];
  }

  private setFormProps(): void {
    this.formDataModel.forEach(formField => (formField.fieldName) ? this.setFormFieldDetails(formField) : undefined);
  }

  private setFormFieldDetails(formField: FormFieldsModel<Partial<SectionCustomFieldProperties | SectionElement>>): void {
    if (new PrerequisitesChecker(formField, this.element).integrates())
      this.formGroup[formField.fieldName] = new FormControlMaker(formField, this.element, this.sectionModelInDS, this.section).make();
  }

  private setFormGroup(): void {
    this.dynamicForm = this.formBuilder.group(this.formGroup);
  }

  private setPayload(): void {
    this.payload = {
      formModel: this.formDataModel,
      formData: this.dynamicForm
    };
  }

}
