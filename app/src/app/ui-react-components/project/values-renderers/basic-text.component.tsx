interface IBasicTextProps {
  value: string
}

export const BasicText: React.FC<IBasicTextProps> = ({ value }) => value ? <>{value}</> : null
