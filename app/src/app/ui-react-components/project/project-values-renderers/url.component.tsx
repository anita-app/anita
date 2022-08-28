interface IUrlProps {
  value: string
}

const removeProtocolFromUrl = (url: string) => url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '');

export const Url: React.FC<IUrlProps> = ({ value }) => value
  ? <a href={value} target="_blank" rel="noreferrer" className="underline">{removeProtocolFromUrl(value)}</a>
  : null;

