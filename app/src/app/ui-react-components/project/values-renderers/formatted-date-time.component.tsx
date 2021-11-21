import * as dateFormat from 'date-format';

export const FormattedDateTime = ({ value }: { value: string }) => value ? dateFormat('yyyy/MM/dd hh:mm', new Date(value)) : null;
