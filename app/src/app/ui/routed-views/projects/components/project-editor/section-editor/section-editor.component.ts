import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { sectionDetails, sectionFieldForEditing, sectionFieldForNewItem } from '@anita/client/data/form-models/section-builder.constant';
import { FORM_COMPONENTS_CODES } from '@anita/client/data/model/form-model-commons';
import {
  AnitaUniversalDataStorage,
  RESERVED_UDS_KEYS,
  SectionCustomFieldProperties,
  SectionDetailsDeclaration,
  SectionElement,
  SectionSystemFieldsProperties
  } from '@anita/client/data/model/project-info';
import { asyncForEach } from '@anita/client/libs/tools/tools';
import { currentRouteConstant } from '@anita/client/ng-services/app-routing/current-route.constant';
import { stateData } from '@anita/client/ng-services/state-data/state-data.constant';
import { EDITOR_MODE } from '@anita/client/ui/editor-mode.enum';
import { FormInfoForBuilder } from '@anita/client/ui/shared-components/forms-automator/form-builder/form-builder';
import { FormDataParserService } from '@anita/client/ui/shared-components/forms-automator/form-builder/services/form-data-parser.service';
import { FormModelExpander } from '@anita/client/ui/shared-components/forms-automator/form-builder/services/form-model-expander.class';
import { FormFieldsModel, FormModel } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';
import { arrayOfFormsArrayValidator } from '@anita/client/ui/shared-components/forms-automator/form-fields/services/forms-array-validator.function';
import { select } from '@ngrx/store';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-section-editor',
  templateUrl: './section-editor.component.html'
})
export class SectionEditorComponent implements OnInit {

  @Input()
  public sectionFieldsGroups: Array<Array<FormInfoForBuilder<FormModel>>>;

  @Input()
  public allIsValid: { state: boolean };

  @Input()
  public sectionIndex: number;

  public isSaving = false;

  private groupCounterForEditMode: number;

  constructor(
    private formDataParser: FormDataParserService
  ) { }

  public ngOnInit(): void {
    (currentRouteConstant.data.mode === EDITOR_MODE.edit) ? this.handleEditing() : this.handleAdding();
  }

  public addSectionField(eleToAdd: Array<Array<FormFieldsModel<SectionElement>>> | Array<Array<FormFieldsModel<SectionCustomFieldProperties>>> | Array<Array<FormFieldsModel<SectionDetailsDeclaration>>> = sectionFieldForNewItem, index: number = 1, values?: any): void {
    const eles = this.formDataParser.make({ formDataModel: eleToAdd as any, element: values });
    if (!this.sectionFieldsGroups[index])
      this.sectionFieldsGroups[index] = [];
    this.sectionFieldsGroups[index].push(eles);
    this.handleFormDataChange(eles.formData, eles.formModel);
    this.checkValidity();
  }

  public removeQuestion(group: number, index: number): void {
    this.sectionFieldsGroups[group].splice(index, 1);
    if (!this.sectionFieldsGroups[group].length)
      this.sectionFieldsGroups.splice(group, 1);
    this.checkValidity();
  }

  private async handleAdding(): Promise<void> {
    this.addSectionField(sectionDetails, 0);
    this.addSectionField(sectionFieldForNewItem);
  }

  private async handleEditing(): Promise<void> {
    const project = await stateData.ngRxStore.pipe(select('project'), take(1)).toPromise<AnitaUniversalDataStorage>();
    const sectionDataToEdit = project[RESERVED_UDS_KEYS._sections][this.sectionIndex];

    if (!sectionDataToEdit)
      return this.handleAdding();

    const sectionData = {
      id: sectionDataToEdit.id,
      title: sectionDataToEdit.title
    };
    this.addSectionField(sectionDetails, 0, sectionData);
    this.groupCounterForEditMode = 1;
    sectionDataToEdit.formModel.forEach(eles => { this.addGroupValuesForEditing(eles); });
  }

  /**
   * Adds a `sectionFieldForNewItem` for each existing section field in the project being edited.
   *
   * @remarks
   * Hidden fields (system fields such as `id` or `dateCreation` are skipped as they are added later programmatically so they don't neet to be in the form.
   */
  private addGroupValuesForEditing(eles: Array<SectionSystemFieldsProperties | SectionCustomFieldProperties>): void {
    eles.forEach(fieldEle => {
      if (fieldEle.componentCode === FORM_COMPONENTS_CODES.hiddenInput)
        return;
      this.addSectionField(sectionFieldForEditing, this.groupCounterForEditMode, fieldEle);
      this.groupCounterForEditMode++;
    });
  }

  private handleFormDataChange(formData: FormGroup, formModel: FormModel): void {
    formData.valueChanges.subscribe(() => {
      new FormModelExpander(formModel, formData).handleTrigger();
      this.checkValidity();
    });
  }

  private checkValidity(): void {
    this.allIsValid.state = arrayOfFormsArrayValidator(this.sectionFieldsGroups);
  }

}
