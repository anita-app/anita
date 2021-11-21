import { RESERVED_FIELDS } from 'app/data/form-models/system-fields-for-sections.constant';
import { FORM_COMPONENTS_CODES, OptionKeysModel } from 'app/data/model/form-model-commons';
import { Section, SectionElement } from 'app/data/model/project-info';
import { FormFieldsModel } from 'app/ui-react-components/shared-components/forms-automator/form-fields/form-fields-model';

/**
 * Builds the form element with the info on the parent section for ParentsSelector
 * 
 * @see ParentsSelector
 */
export class ParentInfoFormEleBuilder {

  private parentInfoFormModel: FormFieldsModel<SectionElement>;
  private options: Array<OptionKeysModel> = [];

  constructor(
    private childOf: Array<string>,
    private sections?: Array<Section>

  ) { }

  public build(): FormFieldsModel<SectionElement> {
    this.setOptions();
    this.setParentSelector();
    return this.parentInfoFormModel;
  }

  private setOptions(): void {
    this.childOf.forEach(sectionName => {
      const sectionInfo = this.sections.find(section => section.id === sectionName);
      this.options.push({ value: sectionName, label: sectionInfo.title });
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

}