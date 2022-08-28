import * as dateFormat from 'date-format';

interface IFormattedDateTimeProps {
  value: string
}

export const FormattedDateTime: React.FC<IFormattedDateTimeProps> = ({ value }) => value ? <>{dateFormat('yyyy/MM/dd hh:mm', new Date(value))}</> : null;
