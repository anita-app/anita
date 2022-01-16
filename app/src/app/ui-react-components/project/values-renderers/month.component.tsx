export const Month = ({ value }: { value: string }) => value
  ? new Date(value).toLocaleString('default', { month: 'short', year: 'numeric' })
  : null;
