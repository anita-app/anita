export const Week = ({ value }: { value: string }) => value
  ? value.split('-W').reverse().join('-').replace(/0(\d+)/, "$1")
  : null;
