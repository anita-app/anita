import { RichTextEditorElement } from 'app/components/shared-components/rich-text-editor/rich-text-editor-element'
import { RichTextEditorHelpers } from 'app/components/shared-components/rich-text-editor/rich-text-editor-helpers.class'
import { RichTextEditorLeaf } from 'app/components/shared-components/rich-text-editor/rich-text-editor-leaf'
import { useCallback, useMemo } from 'react'
import { createEditor } from 'slate'
import { withHistory } from 'slate-history'
import { withReact, Slate, Editable } from 'slate-react'
import type { FC } from 'react'

interface IRichTextProps {
  value: string
}

/** @featurePart field.long-text */
export const RichText: FC<IRichTextProps> = (props) => {
  const renderElement = useCallback((props: any) => <RichTextEditorElement {...props} />, [])
  const renderLeaf = useCallback((props: any) => <RichTextEditorLeaf {...props} />, [])
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])
  // Controlled by the saved text: the same object while it doesn't change, the new content when it does.
  const value = useMemo(() => RichTextEditorHelpers.makeInitialOutputData(props.value), [props.value])
  return (
    <div id="rich-text-editor">
      <Slate
        editor={editor}
        value={value}
      >
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          spellCheck={true}
          readOnly={true}
        />
      </Slate>
    </div>
  )
}
