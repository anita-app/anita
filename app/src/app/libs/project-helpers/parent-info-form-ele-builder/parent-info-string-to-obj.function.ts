export interface Option { value: string, label: string }

interface OptionKeysModelGroup {
  label: string;
  options: Array<Option>
}

/**
 * Transforms the array of string keys to an array of objects with the label and value.
 * This version is for Select components with grouped options.
 * @param parentsInfo the array of the info on the parent, composed by: `[sectionID]|[elementID]`
 * @param selectOptions the options for the react-select component
 */
export function parentInfoStringToObjForOptionsGroup(parentsInfo: Array<string>, selectOptions: Array<OptionKeysModelGroup>): Array<Option> {
  const options = [];

  if (!parentsInfo || !selectOptions)
    return options;

  parentsInfo.forEach(parentInfo => {
    // find the options group by recourevily searching the options by value
    const group = selectOptions.find(group => group.options.find(opt => opt.value === parentInfo));

    if (!group) return;

    // find the option by searching the options of the group
    const option = group.options.find(opt => opt.value === parentInfo);

    if (!option) return;

    options.push(option);
  });


  return options;
}

/**
 * Transforms the array of string keys to an array of objects with the label and value.
 * This version is for Select components with NON grouped options.
 * @param parentsInfo the array of the info on the parent, composed by: `[sectionID]|[elementID]`
 * @param selectOptions the options for the react-select component
 */
export function parentInfoStringToObj(parentsInfo: Array<string>, selectOptions: Array<Option>): Array<Option> {
  const options = [];

  if (!parentsInfo || !selectOptions)
    return options;

  parentsInfo.forEach(parentInfo => {
    // find the option by searching the options of the select element
    const option = selectOptions.find(opt => opt.value === parentInfo);

    if (!option) return;

    options.push(option);
  });


  return options;
}