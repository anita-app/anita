import { BasicText } from 'app/ui-react-components/project/values-renderers/basic-text.component'
import { CheckBoxAsCheck } from 'app/ui-react-components/project/values-renderers/check-box-as-check.component'
import { Color } from 'app/ui-react-components/project/values-renderers/color.component'
import { Email } from 'app/ui-react-components/project/values-renderers/email.component'
import { FormattedDateTime } from 'app/ui-react-components/project/values-renderers/formatted-date-time.component'
import { FormattedDate } from 'app/ui-react-components/project/values-renderers/formatted-date.component'
import { Month } from 'app/ui-react-components/project/values-renderers/month.component'
import { Password } from 'app/ui-react-components/project/values-renderers/password.component'
import { Percentage } from 'app/ui-react-components/project/values-renderers/range.component'
import { Tel } from 'app/ui-react-components/project/values-renderers/tel.component'
import { TextFromOptionsByValue } from 'app/ui-react-components/project/values-renderers/text-from-options-by-value.component'
import { Url } from 'app/ui-react-components/project/values-renderers/url.component'
import { Week } from 'app/ui-react-components/project/values-renderers/week.component'
import { FormFieldsModel, SupportedFormsTypes } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types'
import { FORM_COMPONENTS_CODES } from 'app/ui-react-components/shared-components/forms-automator/form-component-codes.enum'
import { InputSupportedTypes } from 'app/ui-react-components/shared-components/forms-automator/input-supported-types.const'

export const customRenderPicker = (formModel: FormFieldsModel<SupportedFormsTypes>) => {
  const componentCode = typeof formModel.componentCode === 'string' ? parseInt(formModel.componentCode, 10) : formModel.componentCode;
  switch (componentCode) {
    case FORM_COMPONENTS_CODES.basicInput:
      return handleInputType(formModel.type)
    case FORM_COMPONENTS_CODES.basicTextarea:
      return BasicText;
    case FORM_COMPONENTS_CODES.basicSelect:
    case FORM_COMPONENTS_CODES.basicRadio:
      return TextFromOptionsByValue.bind(null, formModel['options']);
    case FORM_COMPONENTS_CODES.basicCheckbox:
      return CheckBoxAsCheck;
    case FORM_COMPONENTS_CODES.datePicker:
      return FormattedDate;
    case FORM_COMPONENTS_CODES.dateTimePicker:
      return FormattedDateTime;
    default:
      console.log('customRenderPicker ~ default')
      console.log('customRenderPicker ~ formModel', formModel)
      return BasicText
  }
}

const handleInputType = (type: InputSupportedTypes) => {
  console.log('handleInputType ~ type', type)
  switch (type) {
    case InputSupportedTypes.color:
      return Color;
    case InputSupportedTypes.date:
      return FormattedDate;
    case InputSupportedTypes.datetimeLocal:
      return FormattedDateTime;
    case InputSupportedTypes.month:
      return Month;
    case InputSupportedTypes.week:
      return Week;
    case InputSupportedTypes.time:
      return BasicText;
    case InputSupportedTypes.email:
      return Email;
    case InputSupportedTypes.tel:
      return Tel;
    case InputSupportedTypes.url:
      return Url;
    case InputSupportedTypes.password:
      return Password;
    case InputSupportedTypes.range:
      return Percentage;
    case InputSupportedTypes.number:
    case InputSupportedTypes.text:
    default:
      return BasicText;
  }
}