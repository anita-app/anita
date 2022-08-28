interface ICheckBoxAsCheckProps {
  value: boolean
}

export const CheckBoxAsCheck: React.FC<ICheckBoxAsCheckProps> = ({ value }) => value ? <>✓</> : null
