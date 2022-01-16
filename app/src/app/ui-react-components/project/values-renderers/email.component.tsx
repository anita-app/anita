export const Email = ({ value }) => value
  ? <a href={`mailto:${value}`} target="_blank" rel="noreferrer" className="underline">{value}</a>
  : null;

