import type { FC } from 'react'

export const RichTextEditorElement: FC<any> = (props) => {
  const style = { textAlign: props.element.align }
  switch (props.element.type) {
    case 'block-quote':
      return (
        <blockquote
          style={style}
          {...props.attributes}
        >
          {props.children}
        </blockquote>
      )
    case 'bulleted-list':
      return (
        <ul
          style={style}
          {...props.attributes}
        >
          {props.children}
        </ul>
      )
    case 'heading-one':
      return (
        <h1
          style={style}
          {...props.attributes}
        >
          {props.children}
        </h1>
      )
    case 'heading-two':
      return (
        <h2
          style={style}
          {...props.attributes}
        >
          {props.children}
        </h2>
      )
    case 'list-item':
      return (
        <li
          style={style}
          {...props.attributes}
        >
          {props.children}
        </li>
      )
    case 'numbered-list':
      return (
        <ol
          style={style}
          {...props.attributes}
        >
          {props.children}
        </ol>
      )
    default:
      return (
        <p
          style={style}
          {...props.attributes}
        >
          {props.children}
        </p>
      )
  }
}
