export const Tel = ({ value }) => value
  ? <a href={`tel:${value}`} target="_blank" rel="noreferrer" className="underline">{value}</a>
  : null;

