import { SectionCustomFieldProperties, SectionSystemFieldsProperties } from '@anita/client/data/model/project-info';
import { FormFieldsModel } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';

export class ComponentCodeToName<T> {

  private sectionFormModel: Array<FormFieldsModel<T>> = [];

  constructor(
    private sectionFormModelFromDataStore: Array<SectionSystemFieldsProperties | SectionCustomFieldProperties>
  ) { }

  public parse(): Array<FormFieldsModel<T>> {
    this.handleGroups();
    return this.sectionFormModel;
  }

  private handleGroups(): void {
    this.sectionFormModelFromDataStore.forEach(ele => this.handleElement(ele));
  }

  private isFieldElement(arg: SectionSystemFieldsProperties | SectionCustomFieldProperties): arg is SectionCustomFieldProperties {
    return (arg as SectionCustomFieldProperties).componentCode !== undefined;
  }

  private handleElement(ele: SectionSystemFieldsProperties | SectionCustomFieldProperties): void {
    if (this.isFieldElement(ele)) {
      this.sectionFormModel.push({
        ...ele,
        externalLabel: true
      } as any);
    }
  }

}
