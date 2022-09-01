import { ISection, SectionElement } from 'app/data/project-structure/project-info'
import { RESERVED_FIELDS } from 'app/data/project-structure/reserved-fields.constant'
import { FormFieldsModel, IOptionKeysModel } from 'app/Components/shared-components/forms-automator/form-automator.types'
import { FORM_COMPONENTS_CODES } from 'app/Components/shared-components/forms-automator/form-component-codes.enum'

/**
 * Builds the form element with the info on the parent section for ParentsSelector
 *
 * @see ParentsSelector
 */
export class ParentInfoFormEleBuilder {
  private parentInfoFormModel: FormFieldsModel<SectionElement>
  private options: Array<IOptionKeysModel> = []

  constructor (
    private childOf: Array<string>,
    private sections?: Array<ISection>

  ) { }

  public build (): FormFieldsModel<SectionElement> {
    this.setOptions()
    this.setParentSelector()
    return this.parentInfoFormModel
  }

  private setOptions (): void {
    this.childOf.forEach(sectionName => {
      const sectionInfo = this.sections.find(section => section.id === sectionName)
      this.options.push({ value: sectionName, label: sectionInfo.title })
    })
  }

  private setParentSelector (): void {
    this.parentInfoFormModel = {
      componentCode: FORM_COMPONENTS_CODES.parentsSelector,
      fieldName: RESERVED_FIELDS.parentsInfo,
      label: 'Parent elements',
      options: this.options
    }
  }
}
