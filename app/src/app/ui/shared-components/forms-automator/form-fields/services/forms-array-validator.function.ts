import { FormInfoForBuilder } from '@anita/client/ui/shared-components/forms-automator/form-builder/form-builder';
import { FormModel } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';

export function formsArrayValidator(arrFormState: Array<FormInfoForBuilder<FormModel>> = []): boolean {
  const index = arrFormState.findIndex(formState => formState.formData.invalid);
  return (index > -1) ? false : true;
}

export function arrayOfFormsArrayValidator(sectionFieldsGroups: Array<Array<FormInfoForBuilder<FormModel>>> = [[]]): boolean {
  let res = true;
  let counter = 0;
  while (res && counter < sectionFieldsGroups.length) {
    res = formsArrayValidator(sectionFieldsGroups[counter]);
    counter++;
  }
  return res;
}
