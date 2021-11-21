import { Option } from 'app/libs/project-helpers/parent-info-form-ele-builder/parent-info-string-to-obj.function';

/**
 * Converts the options used by react-select to a string for storing it in the DB
 * We do not want to store the whole object, only the values, as the label might change.
 */
export function parentInfoObjToString(parentInfoObj: Array<Option>): Array<string> {
  const parentsInfo = [];
  parentInfoObj.forEach(parentInfo => {
    parentsInfo.push(parentInfo.value);
  });
  return parentsInfo;
}