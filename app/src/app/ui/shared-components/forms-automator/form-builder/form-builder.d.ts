import { FormGroup } from '@angular/forms';
import { SectionCustomFieldProperties } from '@anita/client/data/model/project-info';
import { SectionElement } from '@anita/client/data/model/project-info';
import { FormFieldsModel } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';

export interface FormInfoForBuilder<T extends Array<FormFieldsModel<Partial<SectionElement | SectionCustomFieldProperties>>>> {
  formModel: T;
  formData: FormGroup;
}
