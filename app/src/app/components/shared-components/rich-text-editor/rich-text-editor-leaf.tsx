import type { FC } from 'react'

export const RichTextEditorLeaf: FC<any> = (props) => {
  if (props.leaf.bold) {
    props.children = <strong>{props.children}</strong>
  }

  if (props.leaf.code) {
    props.children = <code>{props.children}</code>
  }

  if (props.leaf.italic) {
    props.children = <em>{props.children}</em>
  }

  if (props.leaf.underline) {
    props.children = <u>{props.children}</u>
  }

  return <span {...props.attributes}>{props.children}</span>
}
