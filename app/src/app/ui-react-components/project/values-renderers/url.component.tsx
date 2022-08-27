import { removeProtocolFromUrl } from 'app/libs/tools/remove-protocol-from-url.function'

interface IUrlProps {
  value: string
}

export const Url: React.FC<IUrlProps> = ({ value }) => value
  ? <a href={value} target="_blank" rel="noreferrer" className="underline">{removeProtocolFromUrl(value)}</a>
  : null;

