import { RichTextEditorElement } from 'app/components/shared-components/rich-text-editor/rich-text-editor-element'
import { RichTextEditorHelpers } from 'app/components/shared-components/rich-text-editor/rich-text-editor-helpers.class'
import { RichTextEditorLeaf } from 'app/components/shared-components/rich-text-editor/rich-text-editor-leaf'
import React, { useCallback, useMemo } from 'react'
import { createEditor } from 'slate'
import { withHistory } from 'slate-history'
import { withReact, Slate, Editable } from 'slate-react'

interface IRichTextProps {
  value: string
}

export const RichText: React.FC<IRichTextProps> = ({ value }) => {
  const renderElement = useCallback((props: any) => <RichTextEditorElement {...props} />, [])
  const renderLeaf = useCallback((props: any) => <RichTextEditorLeaf {...props} />, [])
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])
  return (
    <div id="rich-text-editor" className="mt-2">
      <Slate editor={editor} value={RichTextEditorHelpers.makeInitialOutputData(value)}>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          spellCheck={true}
          autoFocus={true}
          readOnly={true}
        />
      </Slate>
    </div>
  )
}
