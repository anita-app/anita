import { ISectionElement } from 'app/models/section-element/section-element.declarations'
import { ISection } from 'app/models/section/section.declarations'
import { RESERVED_FIELDS } from 'app/models/reserved-fields.constant'
import { FormFieldsModel, IOptionKeysModel } from 'app/components/shared-components/forms-automator/form-automator.types'
import { FORM_COMPONENTS_CODES } from 'app/components/shared-components/forms-automator/form-component-codes.enum'

/**
 * Builds the form element with the info on the parent section for ParentsSelector
 *
 * @see ParentsSelector
 */
export class ParentInfoFormEleBuilder {
  private parentInfoFormModel: FormFieldsModel<ISectionElement> | undefined
  private options: Array<IOptionKeysModel> = []

  constructor (
    private childOf: Array<string>,
    private sections?: Array<ISection>

  ) { }

  public build (): FormFieldsModel<ISectionElement> {
    this.setOptions()
    this.setParentSelector()
    return this.parentInfoFormModel!
  }

  private setOptions (): void {
    this.childOf.forEach(sectionName => {
      const sectionInfo = this.sections?.find(section => section.id === sectionName)
      if (sectionInfo) {
        this.options.push({ value: sectionName, label: sectionInfo.title })
      }
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
