
interface IColorProps {
  value: string
}
export const Color: React.FC<IColorProps> = ({ value }) => value
  ? <div className="rounded-full" style={{ backgroundColor: value, width: '25px' }}>&nbsp;</div>
  : null
