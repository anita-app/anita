import type { FC, ReactNode } from 'react'

// Slate passes read-only props: the marks wrap a copy of the children.
export const RichTextEditorLeaf: FC<any> = (props) => {
  let children: ReactNode = props.children

  if (props.leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (props.leaf.code) {
    children = <code>{children}</code>
  }

  if (props.leaf.italic) {
    children = <em>{children}</em>
  }

  if (props.leaf.underline) {
    children = <u>{children}</u>
  }

  return <span {...props.attributes}>{children}</span>
}
