import { OptionKeysModel } from 'app/ui-react-components/shared-components/forms-automator/form-automator.types'

export enum InputSupportedTypes {
  color = 'color',
  date = 'date',
  datetimeLocal = 'datetime-local',
  email = 'email',
  month = 'month',
  number = 'number',
  password = 'password',
  range = 'range',
  tel = 'tel',
  text = 'text',
  time = 'time',
  url = 'url',
  week = 'week'
}

export const INPUT_SUPPORTED_TYPES: Array<OptionKeysModel> = [
  {
    value: InputSupportedTypes.color,
    label: 'Color'
  },
  {
    value: InputSupportedTypes.date,
    label: 'Date'
  },
  {
    value: InputSupportedTypes.datetimeLocal,
    label: 'Datetime Local'
  },
  {
    value: InputSupportedTypes.email,
    label: 'Email'
  },
  {
    value: InputSupportedTypes.month,
    label: 'Month'
  },
  {
    value: InputSupportedTypes.number,
    label: 'Number'
  },
  {
    value: InputSupportedTypes.password,
    label: 'Password'
  },
  {
    value: InputSupportedTypes.range,
    label: 'Range'
  },
  {
    value: InputSupportedTypes.tel,
    label: 'Tel'
  },
  {
    value: InputSupportedTypes.text,
    label: 'Text'
  },
  {
    value: InputSupportedTypes.time,
    label: 'Time'
  },
  {
    value: InputSupportedTypes.url,
    label: 'Url'
  },
  {
    value: InputSupportedTypes.week,
    label: 'Week'
  }
]