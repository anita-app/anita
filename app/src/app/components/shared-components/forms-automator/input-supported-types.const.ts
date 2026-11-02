import type { IOptionKeysModel } from 'app/components/shared-components/forms-automator/form-automator.types'

/**
 * @feature field.short-text
 * @title Short text field
 * @summary A one-line field for names, numbers, e-mail addresses, phone numbers, web addresses, passwords, colours or a value on a slider.
 * @where Project editor: a field of a section with Data type "Short text" and a "Content type". Filled in the form to add or edit a record; shown in the table and grid views, on the details page and in the tabs of linked records.
 * @usage In the project editor, give the field the Data type "Short text" and choose its Content type. When adding or editing a record, type the value in the box (Color opens a colour picker, Range shows a slider). Save the record.
 * @options Content type (default Text): Text, any text; Email, an e-mail address (example shown in the box: name@example.com), displayed as a link that starts a new e-mail; Number, only numbers, with arrows to increase or decrease; Password, hidden while typing and displayed as asterisks with an eye button to reveal it; Color, picked from the colour picker of the browser, displayed as a coloured dot; Range, a slider from 0 to 100, displayed as a percentage (e.g. 40%); Tel, a phone number (example: +1 555 0100), displayed as a link that starts a call; Url, a web address (example: https://), displayed as a link without "https://" and "www." that opens in a new tab.
 * @rules The label is shown above the box: the grey text inside it is only an example of the format. Email, Tel and Url values are checked while typing (see the check of e-mail, phone and web addresses). An empty value is not saved. A Password is hidden only on screen: it is stored like the other values of the record. Range has no minimum, maximum or step to set, and saves nothing until the slider is moved. The first Short text field of type Text (or the first required one) names the records of the section.
 * @errors none
 * @status stable
 * @since 0.1.0
 * @covers field:basicInput, input-type:text, input-type:email, input-type:number, input-type:password, input-type:color, input-type:range, input-type:tel, input-type:url
 * @related field.format-validation, field.required, record.title
 */
export enum TextInputSupportedTypes {
  color = 'color',
  email = 'email',
  number = 'number',
  password = 'password',
  range = 'range',
  tel = 'tel',
  text = 'text',
  url = 'url',
}

/**
 * @feature field.date
 * @title Date field
 * @summary A day, a month or a week, typed or picked from the calendar of the browser.
 * @where Project editor: a field with Data type "Date picker" and a "Date format". Filled in the form to add or edit a record; shown in lists and on the details page.
 * @usage In the project editor, give the field the Data type "Date picker" and choose its Date format. In the form of a record, type the date or open the calendar of the browser and pick it. Save the record.
 * @options Date format (default Date): Date, a day, shown as year/month/day (e.g. 2026/10/31); Month, a month of a year, shown in short in the language of the browser (e.g. Oct 2026); Week, a week of a year, shown as week-year (e.g. 44-2026).
 * @rules The look of the calendar depends on the browser and the device. An empty date is not saved.
 * @errors none
 * @status stable
 * @since 0.1.0
 * @covers field:datePicker, input-type:date, input-type:month, input-type:week
 * @related field.date-time
 */
export enum DateInputSupportedTypes {
  date = 'date',
  month = 'month',
  week = 'week',
}

/**
 * @feature field.date-time
 * @title Date & time field
 * @summary A day with a time of the day, or only a time.
 * @where Project editor: a field with Data type "Date & time" and a "Time format". Filled in the form to add or edit a record; shown in lists and on the details page.
 * @usage In the project editor, give the field the Data type "Date & time" and choose its Time format. In the form of a record, type the value or use the picker of the browser. Save the record.
 * @options Time format (default Date & time): Date & time, shown as year/month/day hours:minutes on a 24-hour clock (e.g. 2026/10/31 14:30); Time only, shown as typed (e.g. 14:30).
 * @rules The time is saved as entered, in the local time of the device, without a time zone. The look of the picker depends on the browser and the device.
 * @errors none
 * @status stable
 * @since 0.1.0
 * @covers field:dateTimePicker, input-type:datetimeLocal, input-type:time
 * @related field.date
 */
export enum DateTimeInputSupportedTypes {
  datetimeLocal = 'datetime-local',
  time = 'time',
}

/** @featurePart field.short-text */
export const TEXT_INPUT_SUPPORTED_TYPES_OPTIONS: Array<IOptionKeysModel> = [
  {
    value: TextInputSupportedTypes.text,
    label: 'Text',
  },
  {
    value: TextInputSupportedTypes.email,
    label: 'Email',
  },
  {
    value: TextInputSupportedTypes.number,
    label: 'Number',
  },
  {
    value: TextInputSupportedTypes.password,
    label: 'Password',
  },
  {
    value: TextInputSupportedTypes.color,
    label: 'Color',
  },
  {
    value: TextInputSupportedTypes.range,
    label: 'Range',
  },
  {
    value: TextInputSupportedTypes.tel,
    label: 'Tel',
  },
  {
    value: TextInputSupportedTypes.url,
    label: 'Url',
  },
]

/** @featurePart field.date */
export const DATE_INPUT_SUPPORTED_TYPES_OPTIONS: Array<IOptionKeysModel> = [
  {
    value: DateInputSupportedTypes.date,
    label: 'Date',
  },
  {
    value: DateInputSupportedTypes.month,
    label: 'Month',
  },
  {
    value: DateInputSupportedTypes.week,
    label: 'Week',
  },
]

/** @featurePart field.date-time */
export const DATE_TIME_INPUT_SUPPORTED_TYPES_OPTIONS: Array<IOptionKeysModel> = [
  {
    value: DateTimeInputSupportedTypes.datetimeLocal,
    label: 'Date & time',
  },
  {
    value: DateTimeInputSupportedTypes.time,
    label: 'Time only',
  },
]
