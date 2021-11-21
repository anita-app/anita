import * as dateFormat from 'date-format';

export const FormattedDate = ({ value }: { value: string }) => value ? dateFormat('yyyy/MM/dd', new Date(value)) : null;
