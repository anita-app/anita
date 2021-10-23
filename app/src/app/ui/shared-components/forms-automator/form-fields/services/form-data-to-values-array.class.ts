import { SectionCustomFieldProperties, SectionDetailsDeclaration } from '@anita/client/data/model/project-info';
import { FormInfoForBuilder } from '@anita/client/ui/shared-components/forms-automator/form-builder/form-builder';
import { FormModel } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';

export class FormDataToValuesArray {

  private arrValues: Array<SectionDetailsDeclaration | SectionCustomFieldProperties> = [];

  constructor(
    private sectionFieldsGroups: Array<FormInfoForBuilder<FormModel>>
  ) { }

  public process(): Array<SectionDetailsDeclaration | SectionCustomFieldProperties> {
    this.handleAllEles();
    return this.arrValues;
  }

  private handleAllEles(): void {
    this.sectionFieldsGroups.forEach(surveyEle => this.pushValuesInArrValues(surveyEle));
  }

  private pushValuesInArrValues(surveyEle: FormInfoForBuilder<FormModel>): void {
    this.arrValues.push(surveyEle.formData.value);
  }

}
