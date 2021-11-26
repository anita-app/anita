import { RESERVED_FIELDS } from 'app/data/model/reserved-fields.constant';
import { FormModel } from 'app/ui-react-components/shared-components/forms-automator/form-fields/form-fields-model';

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
