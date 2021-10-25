import { RESERVED_FIELDS, systemFieldsForSections } from '@anita/client/data/form-models/system-fields-for-sections.constant';
import { FORM_COMPONENTS_CODES } from '@anita/client/data/model/form-model-commons';
import {
  Section,
  SectionCustomFieldProperties,
  SectionDetailsDeclaration,
  SectionSystemFieldsProperties
  } from '@anita/client/data/model/project-info';
import { SectionFormEleGenerator } from '@anita/client/ui/routed-views/projects/services/section-form-ele-generator.class';
import { FormInfoForBuilder } from '@anita/client/ui/shared-components/forms-automator/form-builder/form-builder';
import { FormModel } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';

/**
 * Generates a section to be stored in the `AnitaUniversalDataStorage`
 */
export class SectionGenerator {

  /**
   * Values set by the user when creating the `Section` in 2D Array
   */
  private arrValues: Array<SectionDetailsDeclaration | SectionCustomFieldProperties> = [];
  /**
   * The `Section` to be generated
   */
  private section: Partial<Section> = {};
  private formModel: Array<SectionCustomFieldProperties | SectionSystemFieldsProperties> = [];

  /**
   * Creates an instance of section generator.
   * @param sectionFieldsGroups form info set by the user
   */
  constructor(
    private sectionFieldsGroups: Array<FormInfoForBuilder<FormModel>>
  ) { }

  public generate(): Section {
    this.setArrValues();
    this.setId();
    this.setTitle();
    this.setChildOf();
    this.removeTitleDescriptionGroup();
    this.populateFormModel();
    this.addSystemFields();
    this.setFormModel();
    return this.section as Section;
  }

  /**
   * Converts the form values to a 2D Array of Objects with a key value pair structure.
   */
  private setArrValues(): void {
    this.sectionFieldsGroups.forEach(ele => this.arrValues.push(ele.formData.value));
  }

  /**
   * Sets the id of the section
   */
  private setId(): void {
    this.section.id = this.arrValues[0][RESERVED_FIELDS.id];
  }

  /**
   * Sets the title of the section
   */
  private setTitle(): void {
    this.section.title = this.arrValues[0]['title'];
  }

  /**
   * Sets the childOf of the section
   */
  private setChildOf(): void {
    this.section.childOf = this.arrValues[0]['childOf'];
  }

  /**
   * Removes the title and the description group
   */
  private removeTitleDescriptionGroup(): void {
    this.arrValues.shift();
  }

  /**
   * Loops over all remaining values to populate the form model
   */
  private populateFormModel(): void {
    this.arrValues.forEach((ele: SectionCustomFieldProperties) => this.handleFormEle(ele));
  }

  /**
   * Computes each formModel and stores it in memory
   */
  private handleFormEle(ele: SectionCustomFieldProperties): void {
    this.formModel.push(new SectionFormEleGenerator(ele).make());
  }

  /**
   * Converts `FormFieldsModel<SectionElement>` to a `SectionSystemFieldsProperties` element.
   *
   * @remarks
   * The conversion is advisable to avoid storing in the `AnitaUniversalDataStorage` store the `string` value of the component name.
   * Instead, by saving the `componentCode` we can later change components name without losing retro-compatibility.
   */
  private addSystemFields(): void {
    const systemFields = [];
    systemFieldsForSections.forEach(ele => {
      systemFields.push({
        componentCode: FORM_COMPONENTS_CODES.hiddenInput,
        fieldName: ele.fieldName
      });
    });
    this.formModel.unshift(...systemFields);
  }

  /**
   * Sets formModel on the final `Section`
   */
  private setFormModel(): void {
    this.section.formModel = this.formModel;
  }

}
