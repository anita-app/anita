import { TextTools } from 'app/libs/tools/text-tools.class'
import { IOptionKeysModel } from 'app/components/shared-components/forms-automator/form-automator.types'
import { ISection } from 'app/models/section/section.declarations'

export class SectionElement {
  public static autoGenerateFieldName (section: ISection, labelValue: string | number | boolean | Array<string>): string | null {
    const allExistingFieldNames = section?.formModel?.map(element => element.fieldName) ?? []
    const fieldName = this.generateFieldName(labelValue)
    if (!fieldName) {
      return null
    }
    return this.ensureNameIsUnique(fieldName, allExistingFieldNames)
  }

  public static txtByFieldValue (options: Array<IOptionKeysModel>, toFindId: string | number): string | null {
    // We use relaxed equal (==) here because the value of the radio button might be a string or a number.
    // eslint-disable-next-line eqeqeq
    const optionToReturn = options.find(option => option.value == toFindId)

    if (typeof optionToReturn === 'undefined') {
      return null
    }

    return optionToReturn.label ?? null
  }

  private static generateFieldName (labelValue: string | number | boolean | Array<string>): string | null {
    if (!labelValue) {
      return null
    } else if (typeof labelValue === 'string') {
      return TextTools.cleanString(labelValue)
    } else if (Array.isArray(labelValue)) {
      return TextTools.cleanString(labelValue.join('-'))
    }
    return TextTools.cleanString(labelValue.toString())
  }

  private static ensureNameIsUnique (name: string, existingNames: Array<string>): string {
    let newName = name
    let i = 1
    while (existingNames.includes(newName)) {
      newName = `${name}-${i}`
      i++
    }
    return newName
  }
}
