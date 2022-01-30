import { cleanString } from 'app/libs/tools/tools'

export function autoGenerateFieldName(labelValue: string | number | boolean | Array<string>): string | null {
  if (!labelValue)
    return null;
  else if (typeof labelValue === 'string')
    return cleanString(labelValue);
  else if (Array.isArray(labelValue))
    return cleanString(labelValue.join('-'));
  else
    return cleanString(labelValue.toString());
}