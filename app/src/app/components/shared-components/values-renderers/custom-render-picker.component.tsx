import React from 'react'
import { BasicText } from 'app/components/shared-components/values-renderers/basic-text.component'
import { Color } from 'app/components/shared-components/values-renderers/color.component'
import { Email } from 'app/components/shared-components/values-renderers/email.component'
import { FormattedDateTime } from 'app/components/shared-components/values-renderers/formatted-date-time.component'
import { FormattedDate } from 'app/components/shared-components/values-renderers/formatted-date.component'
import { Month } from 'app/components/shared-components/values-renderers/month.component'
import { Password } from 'app/components/shared-components/values-renderers/password.component'
import { Percentage } from 'app/components/shared-components/values-renderers/range.component'
import { Tel } from 'app/components/shared-components/values-renderers/tel.component'
import { TextFromOptionsByValue } from 'app/components/shared-components/values-renderers/text-from-options-by-value.component'
import { Url } from 'app/components/shared-components/values-renderers/url.component'
import { Week } from 'app/components/shared-components/values-renderers/week.component'
import { FormFieldsModel, TFormFieldWithOptions, TSupportedFormsTypes } from 'app/components/shared-components/forms-automator/form-automator.types'
import { FORM_COMPONENTS_CODES } from 'app/components/shared-components/forms-automator/form-component-codes.enum'
import { DateInputSupportedTypes, DateTimeInputSupportedTypes, TextInputSupportedTypes } from 'app/components/shared-components/forms-automator/input-supported-types.const'
import { RichText } from 'app/components/shared-components/values-renderers/rich-text.component'

const handleInputType = (type: TextInputSupportedTypes | DateInputSupportedTypes | DateTimeInputSupportedTypes | undefined) => {
  switch (type) {
    case TextInputSupportedTypes.color:
      return Color
    case TextInputSupportedTypes.email:
      return Email
    case TextInputSupportedTypes.tel:
      return Tel
    case TextInputSupportedTypes.url:
      return Url
    case TextInputSupportedTypes.password:
      return Password
    case TextInputSupportedTypes.range:
      return Percentage
    case TextInputSupportedTypes.number:
    case TextInputSupportedTypes.text:
    default:
      return BasicText
  }
}

const handleDateType = (type: TextInputSupportedTypes | DateInputSupportedTypes | DateTimeInputSupportedTypes | undefined) => {
  switch (type) {
    case DateInputSupportedTypes.month:
      return Month
    case DateInputSupportedTypes.week:
      return Week
    case DateInputSupportedTypes.date:
    default:
      return FormattedDate
  }
}

const handleDateTimeType = (type: TextInputSupportedTypes | DateInputSupportedTypes | DateTimeInputSupportedTypes | undefined) => {
  switch (type) {
    case DateTimeInputSupportedTypes.time:
      return BasicText
    case DateTimeInputSupportedTypes.datetimeLocal:
    default:
      return FormattedDateTime
  }
}

export const customRenderPicker = (formModel: FormFieldsModel<TSupportedFormsTypes>): React.FC<any> => {
  const componentCode = typeof formModel.componentCode === 'string' ? parseInt((formModel as any).componentCode, 10) : formModel.componentCode
  switch (componentCode) {
    case FORM_COMPONENTS_CODES.basicInput:
      return handleInputType(formModel.type)
    case FORM_COMPONENTS_CODES.datePicker:
      return handleDateType(formModel.type)
    case FORM_COMPONENTS_CODES.dateTimePicker:
      return handleDateTimeType(formModel.type)
    case FORM_COMPONENTS_CODES.richText:
      return RichText
    case FORM_COMPONENTS_CODES.basicTextarea:
      return BasicText
    case FORM_COMPONENTS_CODES.basicSelect:
    case FORM_COMPONENTS_CODES.basicRadio:
      // eslint-disable-next-line dot-notation
      return TextFromOptionsByValue.bind(null, (formModel as TFormFieldWithOptions).options) as unknown as React.FC<any>
    default:
      return BasicText
  }
}
