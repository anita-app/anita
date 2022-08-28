import { cleanString } from 'app/libs/tools/tools'
import { IOptionKeysModel } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types'

export class SectionElement {
  public static autoGenerateFieldName (labelValue: string | number | boolean | Array<string>): string | null {
    if (!labelValue) {
      return null
    } else if (typeof labelValue === 'string') {
      return cleanString(labelValue)
    } else if (Array.isArray(labelValue)) {
      return cleanString(labelValue.join('-'))
    }
    return cleanString(labelValue.toString())
  }

  public static txtByFieldValue (options: Array<IOptionKeysModel>, toFindId: string | number): string | null {
    // We use relaxed equal (==) here because the value of the radio button might be a string or a number.
    // eslint-disable-next-line eqeqeq
    const optionToReturn = options.find(option => option.value == toFindId)

    if (typeof optionToReturn === 'undefined') {
      return null
    }

    return optionToReturn.label
  }
}
