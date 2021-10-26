import { RESERVED_FIELDS } from '@anita/client/data/form-models/system-fields-for-sections.constant';
import { FormModel } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';

export function findFirstUserDefinedField(sectionFormModel: FormModel): number {

  let firstUserDefinedFieldInfo: number = undefined;

  sectionFormModel.some((formEle, index) => {
    if (RESERVED_FIELDS[formEle.fieldName])
      return false;

    firstUserDefinedFieldInfo = index;
    return true;
  });

  return firstUserDefinedFieldInfo;
}
