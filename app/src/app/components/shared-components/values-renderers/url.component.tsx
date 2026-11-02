import type { FC } from 'react'

interface IUrlProps {
  value: string
}

const removeProtocolFromUrl = (url: string) => url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '')

/** @featurePart field.short-text */
export const Url: FC<IUrlProps> = (props) => props.value
  ? (
    <a
      href={props.value}
      target="_blank"
      rel="noreferrer"
      className="underline"
    >
      {removeProtocolFromUrl(props.value)}
    </a>
    )
  : null
