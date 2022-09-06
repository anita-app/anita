import { TIconName } from 'app/libs/icons/icons.class'

export interface IOption { value: string | number; label: string; icon?: TIconName }

interface IOptionKeysModelGroup {
  label: string
  options: Array<IOption>
}

export class ParentElement {
  /**
   * Converts the options used by react-select to a string for storing it in the DB
   * We do not want to store the whole object, only the values, as the label might change.
   */
  public static infoObjectToString (parentInfoObj: Array<IOption>): Array<string> {
    const parentsInfo: Array<string> = []
    parentInfoObj.forEach(parentInfo => {
      parentsInfo.push(parentInfo.value.toString())
    })
    return parentsInfo
  }

  /**
   * Transforms the array of string keys to an array of objects with the label and value.
   * This version is for Select components with NON grouped options.
   * @param parentsInfo the array of the info on the parent, composed by: `[sectionID]|[elementID]`
   * @param selectOptions the options for the react-select component
   */
  public static infoStringToObj (parentsInfo: Array<string>, selectOptions: Array<IOption>): Array<IOption> {
    const options: Array<IOption> = []

    if (!parentsInfo || !selectOptions) {
      return options
    }

    parentsInfo.forEach(parentInfo => {
      // find the option by searching the options of the select element
      const option = selectOptions.find(opt => opt.value === parentInfo)

      if (!option) return

      options.push(option)
    })

    return options
  }

  /**
   * Transforms the array of string keys to an array of objects with the label and value.
   * This version is for Select components with grouped options.
   * @param parentsInfo the array of the info on the parent, composed by: `[sectionID]|[elementID]`
   * @param selectOptions the options for the react-select component
   */
  public static infoStringToObjForOptionsGroup (parentsInfo: Array<string>, selectOptions: Array<IOptionKeysModelGroup>): Array<IOption> {
    const options: Array<IOption> = []

    if (!parentsInfo || !selectOptions) {
      return options
    }

    parentsInfo.forEach(parentInfo => {
      // find the options group by recourevily searching the options by value
      const group = selectOptions.find(group => group.options.find(opt => opt.value === parentInfo))

      if (!group) return

      // find the option by searching the options of the group
      const option = group.options.find(opt => opt.value === parentInfo)

      if (!option) return

      options.push(option)
    })

    return options
  }
}
