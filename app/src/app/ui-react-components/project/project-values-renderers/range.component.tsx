interface IPercentageProps {
  value: string
}

export const Percentage: React.FC<IPercentageProps> = ({ value }) => value ? <>{value}%</> : null
