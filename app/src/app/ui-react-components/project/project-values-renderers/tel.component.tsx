interface ITelProps {
  value: string
}

export const Tel: React.FC<ITelProps> = ({ value }) => value
  ? <a href={`tel:${value}`} target="_blank" rel="noreferrer" className="underline">{value}</a>
  : null;

