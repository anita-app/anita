import { SectionCustomFieldProperties, SectionSystemFieldsProperties } from '@anita/client/data/model/project-info';
import { FormFieldsModel } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';

export class ComponentCodeToName<T> {

  private sectionFormModel: Array<Array<FormFieldsModel<T>>> = [];

  constructor(
    private sectionFormModelFromDataStore: Array<Array<SectionSystemFieldsProperties | SectionCustomFieldProperties>>
  ) { }

  public parse(): Array<Array<FormFieldsModel<T>>> {
    this.handleGroups();
    return this.sectionFormModel;
  }

  private handleGroups(): void {
    this.sectionFormModelFromDataStore.forEach((group, index) => this.handleGroup(group, index));
  }

  private handleGroup(group: Array<SectionSystemFieldsProperties | SectionCustomFieldProperties>, indexLvOne: number): void {
    if (!this.sectionFormModel[indexLvOne])
      this.sectionFormModel[indexLvOne] = [];
    group.forEach(ele => this.handleElement(ele, indexLvOne));
  }

  private isFieldElement(arg: SectionSystemFieldsProperties | SectionCustomFieldProperties): arg is SectionCustomFieldProperties {
    return (arg as SectionCustomFieldProperties).componentCode !== undefined;
  }

  private handleElement(ele: SectionSystemFieldsProperties | SectionCustomFieldProperties, indexLvOne: number): void {
    if (this.isFieldElement(ele)) {
      this.sectionFormModel[indexLvOne].push({
        ...ele,
        externalLabel: true
      } as any);
    }
  }

}
