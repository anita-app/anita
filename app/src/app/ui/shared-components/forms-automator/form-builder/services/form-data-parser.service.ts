import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { dbInstances } from '@anita/client/data/db-instances.const';
import { RESERVED_FIELDS } from '@anita/client/data/form-models/system-fields-for-sections.constant';
import { FORM_COMPONENTS_CODES, OptionKeysModel } from '@anita/client/data/model/form-model-commons';
import {
  RESERVED_UDS_KEYS,
  SectionCustomFieldProperties,
  SectionElement,
  SystemData
  } from '@anita/client/data/model/project-info';
import { SectionModel } from '@anita/client/libs/db-connector/db-builder/sez-definition';
import { currentRouteConstant, URL_PARAMS } from '@anita/client/ng-services/app-routing/current-route.constant';
import { FormInfoForBuilder } from '@anita/client/ui/shared-components/forms-automator/form-builder/form-builder';
import { FormControlMaker } from '@anita/client/ui/shared-components/forms-automator/form-builder/services/form-control-maker.class';
import { PrerequisitesChecker } from '@anita/client/ui/shared-components/forms-automator/form-builder/services/prerequisites-checker.class';
import { FormFieldsModel } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';

interface MakeArgs {
  formDataModel: Array<Array<FormFieldsModel<Partial<SectionCustomFieldProperties | SectionElement>>>>;
  section?: string | number;
  element?: Partial<SectionElement>;
  childOf?: Array<string>;
  sections?: SystemData[RESERVED_UDS_KEYS._sections];
}

@Injectable({
  providedIn: 'root'
})
export class FormDataParserService {

  private formDataModel: Array<Array<FormFieldsModel<Partial<SectionCustomFieldProperties | SectionElement>>>>;
  private formGroup: { [key: string]: FormControl };
  private dynamicForm: FormGroup;
  private element: Partial<SectionElement>;
  private section: string | number;
  private payload: FormInfoForBuilder<Array<Array<FormFieldsModel<Partial<SectionElement>>>>>;
  private sectionModelInDS: SectionModel<SectionElement>;
  private childOf: Array<string>;
  private sections: SystemData[RESERVED_UDS_KEYS._sections];

  constructor(
    private formBuilder: FormBuilder
  ) { }

  public make({ formDataModel, section, element = {}, childOf, sections }: MakeArgs): FormInfoForBuilder<Array<Array<FormFieldsModel<Partial<SectionElement | SectionCustomFieldProperties>>>>> {
    this.formGroup = {};
    this.formDataModel = formDataModel;

    if (section)
      this.setSectionModel(section);

    this.section = (this.sectionModelInDS) ? section : undefined;

    this.element = element;
    this.childOf = childOf;
    this.sections = sections;

    this.setElementPkFromUrlParams();

    this.setParentSelector();
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

  private setParentSelector(): void {
    if (!Array.isArray(this.childOf) || !this.childOf.length)
      return;

    const options: Array<OptionKeysModel> = [];
    this.childOf.forEach(sectionName => {
      const sectionInfo = this.sections.find(section => section.id === sectionName);
      options.push({ value: sectionName, txt: sectionInfo.title });
    });
    this.formGroup[RESERVED_FIELDS.parentsInfo] = new FormControlMaker({ componentCode: FORM_COMPONENTS_CODES.parentsSelector, label: 'Parent elements', options }, this.element, this.sectionModelInDS, this.section).make();
  }

  private setFormProps(): void {
    this.formDataModel.forEach(formFields => formFields.forEach(formField => (formField.fieldName) ? this.setFormFieldDetails(formField) : undefined));
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
