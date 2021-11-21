import { FORM_COMPONENTS_CODES } from 'app/data/model/form-model-commons';
import { BasicText } from 'app/ui-react-components/project/values-renderers/basic-text.component';
import { CheckBoxAsCheck } from 'app/ui-react-components/project/values-renderers/check-box-as-check.component';
import { FormattedDateTime } from 'app/ui-react-components/project/values-renderers/formatted-date-time.component';
import { FormattedDate } from 'app/ui-react-components/project/values-renderers/formatted-date.component';
import { TextFromOptionsByValue } from 'app/ui-react-components/project/values-renderers/text-from-options-by-value.component';
import { FormFieldsModel, SupportedFormsTypes } from 'app/ui-react-components/shared-components/forms-automator/form-fields/form-fields-model';

export const customRenderPicker = (formModel: FormFieldsModel<SupportedFormsTypes>) => {
  switch (formModel.componentCode) {
    case FORM_COMPONENTS_CODES.basicInput:
    case FORM_COMPONENTS_CODES.basicTextarea:
      return BasicText;
    case FORM_COMPONENTS_CODES.basicSelect:
    case FORM_COMPONENTS_CODES.basicRadio:
      return TextFromOptionsByValue.bind(null, formModel.options);
    case FORM_COMPONENTS_CODES.basicCheckbox:
      return CheckBoxAsCheck;
    case FORM_COMPONENTS_CODES.datePicker:
      return FormattedDate;
    case FORM_COMPONENTS_CODES.dateTimePicker:
      return FormattedDateTime;
    default:
      return BasicText
  }
}
