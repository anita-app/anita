import { RESERVED_FIELDS } from 'app/data/project-structure/reserved-fields.constant';
import { FormModel } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types';

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
