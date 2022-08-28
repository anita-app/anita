import * as dateFormat from 'date-format';

interface IFormattedDateProps {
  value: string
}

export const FormattedDate: React.FC<IFormattedDateProps> = ({ value }) => value ? <>{dateFormat('yyyy/MM/dd', new Date(value))}</> : null;
