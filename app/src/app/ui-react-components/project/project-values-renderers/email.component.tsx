interface IEmailProps {
  value: string
}

export const Email: React.FC<IEmailProps> = ({ value }) => value
  ? <a href={`mailto:${value}`} target="_blank" rel="noreferrer" className="underline">{value}</a>
  : null;

