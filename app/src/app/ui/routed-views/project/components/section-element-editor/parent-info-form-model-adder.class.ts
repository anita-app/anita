import { RESERVED_FIELDS } from '@anita/client/data/form-models/system-fields-for-sections.constant';
import { FORM_COMPONENTS_CODES, OptionKeysModel } from '@anita/client/data/model/form-model-commons';
import { RESERVED_UDS_KEYS, SystemData } from '@anita/client/data/model/project-info';
import { FormFieldsModel } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';

export class ParentInfoFormModelAdder {

  private parentInfoFormModel: FormFieldsModel<any>;
  private options: Array<OptionKeysModel> = [];
  private indexWhereToAddParentFormModel: number;

  constructor(
    private formDataModel: Array<FormFieldsModel<unknown>>,
    private childOf: Array<string>,
    private sections?: SystemData[RESERVED_UDS_KEYS._sections]
  ) { }

  public add(): void {
    this.setOptions();
    this.findIndexWhereToAddParentFormModel();
    this.setParentSelector();
    this.addAtIndex();
  }

  private setOptions(): void {
    this.childOf.forEach(sectionName => {
      const sectionInfo = this.sections.find(section => section.id === sectionName);
      this.options.push({ value: sectionName, txt: sectionInfo.title });
    });
  }

  private setParentSelector(): void {
    this.parentInfoFormModel = {
      componentCode: FORM_COMPONENTS_CODES.parentsSelector,
      fieldName: RESERVED_FIELDS.parentsInfo,
      label: 'Parent elements',
      options: this.options
    };
  }

  private findIndexWhereToAddParentFormModel(): void {
    let counter = 0;
    const reservedFields = Object.values(RESERVED_FIELDS);
    while (this.indexWhereToAddParentFormModel === undefined) {
      if (!reservedFields.includes(this.formDataModel[counter].fieldName))
        this.indexWhereToAddParentFormModel = counter;
      counter++;
    }
  }

  private addAtIndex(): void {
    this.formDataModel.splice(this.indexWhereToAddParentFormModel, 0, this.parentInfoFormModel);
  }

}
