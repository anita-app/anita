import { isValidElement } from 'react'
import { RichTextEditorLeaf } from 'app/components/shared-components/rich-text-editor/rich-text-editor-leaf'
import type { ReactElement, ReactNode } from 'react'

const render = (leaf: Record<string, boolean>): ReactElement<{ children: ReactNode }> => (
  // Slate passes frozen props to renderLeaf.
  RichTextEditorLeaf(Object.freeze({ leaf, attributes: { 'data-slate-leaf': true }, children: 'text' })) as ReactElement<{ children: ReactNode }>
)

const tagsOf = (node: ReactNode): Array<string> => {
  if (!isValidElement<{ children: ReactNode }>(node)) {
    return []
  }
  return [node.type as string, ...tagsOf(node.props.children)]
}

describe('RichTextEditorLeaf', () => {
  it('renders plain text without changing the props it receives', () => {
    expect(tagsOf(render({}))).toEqual(['span'])
  })

  it('wraps the text in every mark of the leaf', () => {
    expect(tagsOf(render({ bold: true, italic: true, underline: true, code: true }))).toEqual(['span', 'u', 'em', 'code', 'strong'])
  })
})
