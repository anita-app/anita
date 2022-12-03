import React, { useCallback, useMemo } from 'react'
import isHotkey from 'is-hotkey'
import { Editable, withReact, useSlate, Slate } from 'slate-react'
import {
  Editor,
  Transforms,
  createEditor,
  Descendant,
  Element as SlateElement,
  BaseEditor
} from 'slate'
import { withHistory } from 'slate-history'

import { TIconName } from 'app/libs/icons/icons.class'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import './rich-text-editor.css'
import { RichTextEditorElement } from 'app/components/shared-components/rich-text-editor/rich-text-editor-element'
import { RichTextEditorLeaf } from 'app/components/shared-components/rich-text-editor/rich-text-editor-leaf'

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code'
}

const LIST_TYPES = ['numbered-list', 'bulleted-list']
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify']

const isBlockActive = (editor: BaseEditor, format: string, blockType = 'type') => {
  const { selection } = editor as any
  if (!selection) return false

  const [match] = Array.from(
    (Editor as any).nodes(editor, {
      at: (Editor as any).unhangRange(editor, selection),
      match: (n: any) => !(Editor as any).isEditor(n) &&
        SlateElement.isElement(n) &&
        (n as any)[blockType as any] === format
    })
  )

  return !!match
}

const isMarkActive = (editor: BaseEditor, format: string | number) => {
  const marks = Editor.marks(editor) as any
  if (!marks) {
    return false
  }

  const marksToCheck = marks![format as any] as any
  return marks ? marksToCheck === true : false
}

const toggleBlock = (editor: BaseEditor, format: string) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
  )
  const isList = LIST_TYPES.includes(format)

  Transforms.unwrapNodes(editor, {
    match: n => !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes((n as any).type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true
  })
  let newProperties: Partial<SlateElement>
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format
    } as Partial<SlateElement>
  } else {
    newProperties = {
      type: isActive ? 'paragraph' : isList ? 'list-item' : format
    } as Partial<SlateElement>
  }
  Transforms.setNodes<SlateElement>(editor, newProperties)

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

const toggleMark = (editor: BaseEditor, format: string) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const MarkButton = ({ format, icon }: { format: string; icon: TIconName }) => {
  const editor = useSlate()
  return (
    <Button
      id={icon}
      size="sm"
      iconLeft={icon}
      type={Type.transparent}
      label={format}
      labelClassName="hidden"
      className={isMarkActive(editor, format) ? 'bg-gray-200' : ''}
      marginClassName=""
      onMouseDown={(e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        toggleMark(editor, format)
      }}
    />
  )
}

const BlockButton = ({ format, icon }: { format: string; icon: TIconName }) => {
  const editor = useSlate()
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
  )
  return (
    <Button
      id={icon}
      iconLeft={icon}
      type={Type.transparent}
      label={format}
      className={isActive ? 'bg-gray-200' : ''}
      marginClassName=""
      labelClassName="hidden"
      onMouseDown={(e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        toggleBlock(editor, format)
      }}
    />
  )
}

interface IRichTextEditorProps {
  initialValue: Array<Descendant>
  onChange: (value: Array<Descendant>) => void
}

export const RichTextEditor: React.FC<IRichTextEditorProps> = (props) => {
  const renderElement = useCallback((props: any) => <RichTextEditorElement {...props} />, [])
  const renderLeaf = useCallback((props: any) => <RichTextEditorLeaf {...props} />, [])
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])

  const onChange = (value: Array<Descendant>) => {
    props.onChange(value)
  }

  return (
    <div id="rich-text-editor" className="border-2 border-gray-200 rounded-lg p-2">
      <Slate editor={editor} value={props.initialValue} onChange={onChange}>
        <div id="rich-text-editor-toolbar" className="relative border-b border-gray-300 pb-2">
          <MarkButton format="bold" icon="format_bold" />
          <MarkButton format="italic" icon="format_italic" />
          <MarkButton format="underline" icon="format_underlined" />
          <MarkButton format="code" icon="format_code" />
          <BlockButton format="heading-one" icon="format_looks_one" />
          <BlockButton format="heading-two" icon="format_looks_two" />
          <BlockButton format="block-quote" icon="format_quote" />
          <BlockButton format="numbered-list" icon="format_list_numbered" />
          <BlockButton format="bulleted-list" icon="format_list_bulleted" />
          <BlockButton format="left" icon="format_align_left" />
          <BlockButton format="center" icon="format_align_center" />
          <BlockButton format="right" icon="format_align_right" />
          <BlockButton format="justify" icon="format_align_justify" />
        </div>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="Enter text…"
          spellCheck={true}
          autoFocus={true}
          onKeyDown={event => {
            for (const hotkey in HOTKEYS) {
              if (isHotkey(hotkey, event as any)) {
                event.preventDefault()
                const mark = HOTKEYS[hotkey as keyof typeof HOTKEYS]
                toggleMark(editor, mark)
              }
            }
          }}
        />
      </Slate>
    </div>
  )
}
