import { SectionCustomFieldProperties } from 'app/data/project-structure/project-info';
import { FORM_COMPONENTS_CODES } from 'app/ui-react-components/shared-components/forms-automator/form-component-codes.enum';

/**
 * Creates a section form element based on the information provided by the user when creating/editing a project
 */
export class SectionFormEleGenerator {

  /**
   * The field element to return
   */
  private fieldElement: SectionCustomFieldProperties;

  /**
   * Creates an instance of section form ele generator.
   * @param ele the details specified by the user
   */
  constructor(
    private ele: SectionCustomFieldProperties
  ) { }

  /**
   * Sets mandatory field, adds options and sets the required validator 
   */
  public make(): SectionCustomFieldProperties {
    this.setManadatory();
    this.setOptions();
    this.setRequiredValidator();
    return this.fieldElement;
  }

  /**
   * Sets manadatory fields
   */
  private setManadatory(): void {
    this.fieldElement = {
      componentCode: this.ele.componentCode,
      fieldName: this.ele.fieldName,
      label: this.ele.label
    };
  }

  /**
   * Sets options, if the field element has any
   */
  private setOptions(): void {
    if (this.ele.options)
      this.fieldElement.options = this.ele.options;
  }

  /**
   * Sets the required validator, if it is a required form
   */
  private setRequiredValidator(): void {
    if (this.ele.required)
      this.fieldElement.required = true;
  }

}
