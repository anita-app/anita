import { RESERVED_FIELDS } from 'app/data/project-structure/reserved-fields.constant';
import { FormFieldsModel, FormModel, SupportedFormsTypes } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types';
import { FORM_COMPONENTS_CODES } from 'app/ui-react-components/shared-components/forms-automator/form-component-codes.enum';

export function findFirstUserDefinedField(sectionFormModel: FormModel): number {

  let firstUserDefinedFieldInfo: number = 0;

  sectionFormModel.some((formEle, index) => {
    if (RESERVED_FIELDS[formEle.fieldName])
      return false;

    firstUserDefinedFieldInfo = index;
    return true;
  });

  return firstUserDefinedFieldInfo;
}

export function findFirstFieldOfType(sectionFormModel: FormModel, types: Array<FORM_COMPONENTS_CODES>): FormFieldsModel<SupportedFormsTypes> | undefined {
  return sectionFormModel.find(formModel => types.includes(parseInt(formModel.componentCode as unknown as string)))
}