import type { FC } from 'react'

interface IMultilineTextProps {
  value: string
}

/**
 * Plain text that keeps its line breaks.
 */
export const MultilineText: FC<IMultilineTextProps> = (props) => (props.value ? <span className="whitespace-pre-line">{props.value}</span> : null)
