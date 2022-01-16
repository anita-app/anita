import { removeProtocolFromUrl } from 'app/libs/tools/remove-protocol-from-url.function'

export const Url = ({ value }) => value
  ? <a href={value} target="_blank" rel="noreferrer" className="underline">{removeProtocolFromUrl(value)}</a>
  : null;

