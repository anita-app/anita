import { OptionKeysModel } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types'

export enum TextInputSupportedTypes {
  color = 'color',
  email = 'email',
  number = 'number',
  password = 'password',
  range = 'range',
  tel = 'tel',
  text = 'text',
  url = 'url'
}

export enum DateInputSupportedTypes {
  date = 'date',
  month = 'month',
  week = 'week'
}

export enum DateTimeInputSupportedTypes {
  datetimeLocal = 'datetime-local',
  time = 'time',
}

export const TEXT_INPUT_SUPPORTED_TYPES_OPTIONS: Array<OptionKeysModel> = [
  {
    value: TextInputSupportedTypes.text,
    label: 'Text'
  },
  {
    value: TextInputSupportedTypes.email,
    label: 'Email'
  },
  {
    value: TextInputSupportedTypes.number,
    label: 'Number'
  },
  {
    value: TextInputSupportedTypes.password,
    label: 'Password'
  },
  {
    value: TextInputSupportedTypes.color,
    label: 'Color'
  },
  {
    value: TextInputSupportedTypes.range,
    label: 'Range'
  },
  {
    value: TextInputSupportedTypes.tel,
    label: 'Tel'
  },
  {
    value: TextInputSupportedTypes.url,
    label: 'Url'
  }
]

export const DATE_INPUT_SUPPORTED_TYPES_OPTIONS: Array<OptionKeysModel> = [
  {
    value: DateInputSupportedTypes.date,
    label: 'Date'
  },
  {
    value: DateInputSupportedTypes.month,
    label: 'Month'
  },
  {
    value: DateInputSupportedTypes.week,
    label: 'Week'
  }
]

export const DATE_TIME_INPUT_SUPPORTED_TYPES_OPTIONS: Array<OptionKeysModel> = [
  {
    value: DateTimeInputSupportedTypes.datetimeLocal,
    label: 'Date & time'
  },
  {
    value: DateTimeInputSupportedTypes.time,
    label: 'Time only'
  }
]