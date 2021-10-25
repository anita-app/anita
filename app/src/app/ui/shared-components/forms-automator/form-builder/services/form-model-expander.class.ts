import { FormGroup } from '@angular/forms';
import { SectionCustomFieldProperties, SectionElement } from '@anita/client/data/model/project-info';
import { FormControlMaker } from '@anita/client/ui/shared-components/forms-automator/form-builder/services/form-control-maker.class';
import { PrerequisitesChecker } from '@anita/client/ui/shared-components/forms-automator/form-builder/services/prerequisites-checker.class';
import { FormFieldsModel, FormModel } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';

export class FormModelExpander {

  private formElesToDispatch: Array<FormFieldsModel<Partial<SectionCustomFieldProperties | SectionElement>>> = [];
  private formElesToCheck: Array<FormFieldsModel<Partial<SectionCustomFieldProperties | SectionElement>>> = [];

  constructor(
    private formModel: FormModel,
    private formData: FormGroup
  ) { }

  public handleTrigger(): void {
    this.setFormElesToCheck();

    this.formElesToCheck.forEach(ele => this.handleEachEle(ele));
  }

  private handleEachEle(formEleToCheck: FormFieldsModel<Partial<SectionCustomFieldProperties | SectionElement>>): void {
    if (new PrerequisitesChecker(formEleToCheck, this.formData.value).integrates())
      this.handleToAdd(formEleToCheck);
    else
      this.handleToRemove(formEleToCheck);
  }

  private handleToAdd(formEleToAdd: FormFieldsModel<Partial<SectionCustomFieldProperties | SectionElement>>): void {
    if (this.isAlreadyInFormData(formEleToAdd.fieldName))
      return;

    const formControl = new FormControlMaker(formEleToAdd).make();
    this.formData.addControl(formEleToAdd.fieldName, formControl);
    this.formElesToDispatch.push(formEleToAdd);
  }

  private isAlreadyInFormData(eleToAdd: string): boolean {
    return (this.formData.controls[eleToAdd]) ? true : false;
  }

  private handleToRemove(formEleToRemove: FormFieldsModel<Partial<SectionCustomFieldProperties | SectionElement>>): void {
    if (!this.isAlreadyInFormData(formEleToRemove.fieldName))
      return;

    this.formData.removeControl(formEleToRemove.fieldName);
    this.formElesToDispatch.push(formEleToRemove);
  }

  private setFormElesToCheck(): void {
    this.formElesToCheck = this.formModel.filter(ele => {
      return ele.prerequisites && Object.keys(ele.prerequisites).length;
    });
  }
}
